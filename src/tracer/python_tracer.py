import sys
import json
import ast
import builtins
import copy
import io

from ast_transformer import ASTTransformer, BEFORE_STATEMENT_MARKER, AFTER_STATEMENT_MARKER, BEFORE_EXPRESSION_MARKER, AFTER_EXPRESSION_MARKER
from relationship_analyzer import RelationshipAnalyzer
from utils import serialize_value, calculate_delta, TreeNode, Node, ListNode, adjlist_to_graph, list_to_binary_tree, list_to_linked_list, is_collection

class PythonTracer:
    """Tracer that tracks execution of all statements and expressions"""
    def __init__(self, is_server: bool = False):
        self.reset()
        self._is_server = is_server
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
                
    def _record_step(self, frame, event, has_value=False, value=None, node=None):
        """Record a step in the execution"""
        if node is None or not hasattr(node, "lineno"):
            return
        node_id = self.transformer.get_node_id(node)
                    
        local_vars = {}
        if frame is not None:
            local_vars = {
                name: serialize_value(val)
                for name, val in frame.f_locals.items()
                if not name.startswith('_') and not callable(val)
            }
            var_table = {
                name: id(val)
                for name, val in frame.f_locals.items()
                if not name.startswith('_') and not callable(val)
            }
            object_table = self._build_object_table({
                name: val
                for name, val in frame.f_locals.items()
                if not name.startswith('_') and not callable(val)
            })
        else:
            object_table = {}
            var_table = {}
            
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
            "node_id": node_id,
            "locals": local_vars,
            "object_table": object_table,
            "var_table": var_table
        }

        # if a value was evaluated
        if has_value:
            step["value"] = serialize_value(value)
            if node_id in self.transformer.tests:
                step["test"] = bool(value)

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
        # We dont' want to replace the whole formatted string with a sub value
        if isinstance(node, ast.FormattedValue):
            return value
        # Skip recording if the value is callable (e.g., x.append in x.append(2))
        if callable(value):
            return value
        frame = sys._getframe(1)
        self._record_step(frame, "after_expression", has_value=True, value=value, node=node)
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
        original_stdout = sys.stdout
        # Capture stdout during execution
        captured_output = io.StringIO()
        tree = None

        # Wrap all user code within a try, so we dont fail
        try:
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
            
            # Set up stdout tracking for step deltas
            self.stdout_buffer = captured_output
            self.previous_stdout_length = 0
            # Redirect stdout
            sys.stdout = captured_output
            
            compiled = compile(tree, '<string>', 'exec')
            exec(compiled, namespace)
            
            # If entrypoint is specified, call the function with transformed kwargs
            if entrypoint and entrypoint in namespace:
                self.result = namespace[entrypoint](**transformed_kwargs)
        except Exception as e:
            # Do not allow clients to swallow errors. We allow for server to generate templates
            if not self._is_server:
                raise e
            # if there is an error, we don't generate a trace
            print(f"Error executing code: {e}")
            self.steps = []
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

        if transformed_ast is None:
            return {
                'metadata': {
                    'code': self.source_code,
                    'function': getattr(self, 'entrypoint', None),
                    'inputs': {
                        'kwargs': {k: repr(v) for k, v in getattr(self, 'inputs', {}).items()}
                    },
                    'stdout': self.captured_output,
                    'finalLocals': {},
                },
                'ast': {},
                'relationships': [],
                'trace': [],
                'result': serialize_value(self.result),
            } 

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
        var_table = {}
        object_table = {}
        
        def _create_trace_entry(line, locals, steps, object_table, var_table):
            # Calculate delta from previous locals
            delta = calculate_delta(prev_locals, locals)

            processed_steps = []
            for s in steps:
                filtered = dict(s)
                if filtered.get("locals") == locals:
                    filtered.pop("locals")
                if filtered.get("object_table") == object_table:
                    filtered.pop("object_table")
                if filtered.get("var_table") == var_table:
                    filtered.pop("var_table")
                processed_steps.append(filtered)

            return {
                "line_number": line,
                "locals": locals,
                "delta": delta,
                "object_table": object_table,
                "var_table": var_table,
                "steps": processed_steps
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
                    trace.append(_create_trace_entry(current_line, line_locals, current_steps, object_table, var_table))
                current_line = line
                current_steps = []
                prev_locals = line_locals.copy()  # Save previous line's locals
                line_locals = step["locals"]
                object_table = step["object_table"]
                var_table = step["var_table"]
            current_steps.append(step)
        
        if current_steps:
            trace.append(_create_trace_entry(current_line, line_locals, current_steps, object_table, var_table  ))

        # Edge case if the last step is an assignment, we need another line to display the delta
        line_locals = self.steps[-1]["locals"] if self.steps and "locals" in self.steps[-1] else {}
        if trace and line_locals:
            last_entry = trace[-1]
            # If the last entry's locals do not match the final locals, append a synthetic entry
            if last_entry["locals"] != line_locals:
                trace.append({
                    "line_number": last_entry["line_number"],
                    "locals": line_locals,
                    "object_table": object_table,
                    "var_table": var_table,
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

    def _build_object_table(self, variables):
        """
        Recursively build an object table for all referenced objects in variables.
        Returns: {id(obj): {"type": ..., "value": ..., "isCollection": ...}}
        """
        object_table = {}
        visited = set()

        def add_object(obj):
            obj_id = id(obj)
            if obj_id in visited:
                return
            visited.add(obj_id)
            collection = is_collection(obj)
            obj_type = type(obj).__name__
            if collection:
                if isinstance(obj, list):
                    value = []
                    for item in obj:
                        value.append(id(item))
                        add_object(item)
                elif isinstance(obj, tuple):
                    value = []
                    for item in obj:
                        value.append(id(item))
                        add_object(item)
                elif isinstance(obj, dict):
                    value = {}
                    for k, v in obj.items():
                        value[serialize_value(k)] = id(v)
                        add_object(v)
                elif isinstance(obj, set):
                    value = []
                    for item in obj:
                        value.append(id(item))
                        add_object(item)
                else:  # custom class
                    # Store attributes (excluding private and methods)
                    value = {}
                    for attr in dir(obj):
                        if attr.startswith("_"):
                            continue
                        try:
                            attr_val = getattr(obj, attr)
                        except Exception:
                            continue
                        if callable(attr_val):
                            continue
                        value[attr] = id(attr_val)
                        add_object(attr_val)
            else:
                value = serialize_value(obj)  # For immutables, store value directly
            object_table[obj_id] = {
                "type": obj_type,
                "value": value,
                "isCollection": collection
            }

        for name, obj in variables.items():
            add_object(obj)

        return object_table 