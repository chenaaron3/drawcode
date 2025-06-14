import sys
import json
import ast
import builtins
import copy
import io

from ast_transformer import ASTTransformer, BEFORE_STATEMENT_MARKER, AFTER_STATEMENT_MARKER, BEFORE_EXPRESSION_MARKER, AFTER_EXPRESSION_MARKER
from relationship_analyzer import RelationshipAnalyzer
from utils import serialize_value, calculate_delta, TreeNode, Node, ListNode, adjlist_to_graph, list_to_binary_tree, list_to_linked_list


class PythonTracer:
    """Tracer that tracks execution of all statements and expressions"""
    def __init__(self):
        self.reset()
        self._install_marker_functions()
        
    def reset(self):
        """Reset the tracer's state"""
        self.steps = []
        self.step_id = 0
        self.source_code = None
        self.transformer = ASTTransformer()
        self.relationship_analyzer = RelationshipAnalyzer()
        self.entrypoint = None
        self.inputs = {}
        self.result = None
        self.captured_output = ""
        self.stdout_buffer = None
        self.previous_stdout_length = 0

    def _install_marker_functions(self):
        """Make marker functions available in builtin scope"""
        marker_functions = {
            BEFORE_STATEMENT_MARKER: self._thonny_hidden_before_stmt,
            AFTER_STATEMENT_MARKER: self._thonny_hidden_after_stmt,
            BEFORE_EXPRESSION_MARKER: self._thonny_hidden_before_expr,
            AFTER_EXPRESSION_MARKER: self._thonny_hidden_after_expr
        }
        
        for name, func in marker_functions.items():
            if not hasattr(builtins, name):
                setattr(builtins, name, func)
                
    def _record_step(self, frame, event, value=None, node=None):
        """Record a step in the execution"""
        if node is None or not hasattr(node, "lineno"):
            return
            
        # Get local variables, filtering out special ones
        local_vars = {}
        if frame is not None:
            local_vars = {
                name: serialize_value(val)
                for name, val in frame.f_locals.items()
                if not name.startswith('_') and not callable(val)
            }
            
        # Capture stdout delta if we have a buffer
        stdout_delta = ""
        if self.stdout_buffer is not None:
            current_stdout = self.stdout_buffer.getvalue()
            current_length = len(current_stdout)
            if current_length > self.previous_stdout_length:
                stdout_delta = current_stdout[self.previous_stdout_length:]
                self.previous_stdout_length = current_length
                
        step = {
            "step": self.step_id,
            "event": event,
            "focus": ast.get_source_segment(self.source_code, node),
            "node_id": self.transformer.get_node_id(node),
            "locals": local_vars
        }

        if value is not None:
            step["value"] = serialize_value(value)
            
        if stdout_delta:
            step["stdout"] = stdout_delta
        
        self.step_id += 1
        self.steps.append(step)

    def _thonny_hidden_before_stmt(self, node_id):
        """Marker function called before statements"""
        node = self.transformer.get_node(node_id)
        if node is None:
            return node_id
        frame = sys._getframe(1)
        self._record_step(frame, "before_statement", node=node)
        return node_id
        
    def _thonny_hidden_after_stmt(self, node_id):
        """Marker function called after statements"""
        node = self.transformer.get_node(node_id)
        if node is None:
            return node_id
        frame = sys._getframe(1)
        self._record_step(frame, "after_statement", node=node)
        return node_id
        
    def _thonny_hidden_before_expr(self, node_id):
        """Marker function called before expressions"""
        node = self.transformer.get_node(node_id)
        if node is None:
            return node_id
        frame = sys._getframe(1)
        self._record_step(frame, "before_expression", node=node)
        return node_id
        
    def _thonny_hidden_after_expr(self, node_id, value):
        """Marker function called after expressions with their values"""
        node = self.transformer.get_node(node_id)
        if node is None:
            return value
        frame = sys._getframe(1)
        self._record_step(frame, "after_expression", value=value, node=node)
        return value
    
    def transform_inputs(self, kwargs, special_inputs):
        """Transform inputs - convert special input formats to appropriate objects"""
        if special_inputs is None:
            return kwargs
        transformed_kwargs = copy.deepcopy(kwargs)
        for special_input in special_inputs:
            key = special_input["key"]
            input_type = special_input["type"]
            output_key = special_input["output_key"]
            if key in transformed_kwargs:
                if input_type == "tree":
                    transformed_kwargs[output_key] = list_to_binary_tree(transformed_kwargs[key])
                elif input_type == "graph":
                    transformed_kwargs[output_key] = adjlist_to_graph(transformed_kwargs[key])
                elif input_type == "linkedList":
                    transformed_kwargs[output_key] = list_to_linked_list(transformed_kwargs[key])
                if key != output_key:
                    del transformed_kwargs[key]
        return transformed_kwargs

    def run_code(self, code: str, entrypoint: str, special_inputs: list | None, problem_key: int, manual_relationships: list | None = None, **kwargs):
        """Run code with expression tracking and stdout capture"""
        self.source_code = code
        self.entrypoint = entrypoint
        self.inputs = copy.deepcopy(kwargs)  # Deep copy kwargs dict
        self.manual_relationships = manual_relationships or []
        
        # Transform the AST for execution
        tree = self.transformer.transform(code, problem_key)

        # Transform inputs - convert special input formats to appropriate objects
        transformed_kwargs = self.transform_inputs(kwargs, special_inputs)
        
        namespace = {
            '__name__': '__main__',
            '__file__': '<string>',
            '__builtins__': __builtins__,
            'TreeNode': TreeNode,  # Make TreeNode available in execution namespace
            'Node': Node,  # Make Node available in execution namespace
            'ListNode': ListNode,  # Make ListNode available in execution namespace
        }
        
        # Capture stdout during execution
        original_stdout = sys.stdout
        captured_output = io.StringIO()
        
        # Set up stdout tracking for step deltas
        self.stdout_buffer = captured_output
        self.previous_stdout_length = 0
        
        try:
            # Redirect stdout
            sys.stdout = captured_output
            
            compiled = compile(tree, '<string>', 'exec')
            exec(compiled, namespace)
            
            # If entrypoint is specified, call the function with transformed kwargs
            if entrypoint and entrypoint in namespace:
                self.result = namespace[entrypoint](**transformed_kwargs)
                
        finally:
            # Always restore original stdout
            sys.stdout = original_stdout
            # Store the captured output
            self.captured_output = captured_output.getvalue()
            # Clean up stdout tracking
            self.stdout_buffer = None
        
        return tree

    def save_results(self, filename: str, transformed_ast):
        """Save results to a JSON file with steps grouped by line number"""
        # Get the trace data using the existing method
        trace_data = self.get_trace_data(transformed_ast)
        
        # Save to file
        with open(filename, 'w') as f:
            json.dump(trace_data, f, indent=2)

    def get_trace_data(self, transformed_ast):
        """Get trace data as a dictionary without saving to file"""
        print(f"Total steps recorded: {len(self.steps)}")

        # Unwrap the transformed AST back to original structure while preserving node IDs
        unwrapped_ast = self.transformer.unwrap_transformed_ast(transformed_ast)

        # Analyze relationships from the unwrapped AST (clean structure with node IDs)
        relationships = self.relationship_analyzer.analyze_ast(unwrapped_ast, self.transformer, self.manual_relationships)

        print(f"Found {len(relationships)} relationships")
        
        trace = []
        current_line = None
        current_steps = []
        line_locals = {}
        prev_locals = {}  # Track previous locals for delta calculation
        
        def _create_trace_entry(line, locals, steps):
            # Calculate delta from previous locals
            delta = calculate_delta(prev_locals, locals)
            
            return {
                "line_number": line,
                "locals": locals,
                "delta": delta,
                "steps": [
                    {k: v for k, v in s.items() if k != "locals"}
                    if s["locals"] == locals
                    else s
                    for s in steps
                ]
            }
            
        for step in self.steps:
            node = self.transformer.get_node(step["node_id"])
            if node is None:
                print(f"Warning: No node found for ID {step['node_id']}")
                continue
                
            line = node.lineno
            
            # Start a new line entry if:
            # 1. Line number changed, or  
            # 2. We're starting a new statement execution (before_statement event)
            should_start_new_line = (
                current_line != line or 
                step["event"] == "before_statement"
            )
            
            if should_start_new_line:
                if current_steps:
                    trace.append(_create_trace_entry(current_line, line_locals, current_steps))
                current_line = line
                current_steps = []
                prev_locals = line_locals.copy()  # Save previous line's locals
                line_locals = step["locals"]
            current_steps.append(step)
        
        if current_steps:
            trace.append(_create_trace_entry(current_line, line_locals, current_steps))

        # Edge case if the last step is an assignment, we need another line to display the delta
        line_locals = self.steps[-1]["locals"] if self.steps and "locals" in self.steps[-1] else {}
        if trace and line_locals:
            last_entry = trace[-1]
            # If the last entry's locals do not match the final locals, append a synthetic entry
            if last_entry["locals"] != line_locals:
                trace.append({
                    "line_number": last_entry["line_number"],
                    "locals": line_locals,
                    "delta": calculate_delta(last_entry["locals"], line_locals),
                    "steps": [last_entry["steps"][0]] 
                })

        print(f"Generated {len(trace)} trace entries")

        # Use the unwrapped AST for JSON output (clean structure with node IDs)
        json_ast = self.transformer.ast_to_dict(unwrapped_ast, self.source_code)
        
        return {
            'metadata': {
                'code': self.source_code,
                'function': getattr(self, 'entrypoint', None),
                'inputs': {
                    'kwargs': {k: repr(v) for k, v in getattr(self, 'inputs', {}).items()}
                },
                'stdout': self.captured_output,
                'finalLocals': line_locals.copy() if line_locals else {},
            },
            'ast': json_ast,
            'relationships': relationships,
            'trace': trace,
            'result': serialize_value(self.result),
        } 