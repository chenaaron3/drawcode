import sys
import json
import ast
import builtins

from ast_transformer import ASTTransformer, BEFORE_STATEMENT_MARKER, AFTER_STATEMENT_MARKER, BEFORE_EXPRESSION_MARKER, AFTER_EXPRESSION_MARKER
from relationship_analyzer import RelationshipAnalyzer

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
                name: self._serialize_value(val)
                for name, val in frame.f_locals.items()
                if not name.startswith('_') and not callable(val)
            }
                
        step = {
            "step": self.step_id,
            "event": event,
            "focus": ast.get_source_segment(self.source_code, node),
            "node_id": self.transformer.get_node_id(node),
            "locals": local_vars
        }

        if value is not None:
            step["value"] = self._serialize_value(value)
        
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

    def _serialize_value(self, val):
        """Convert value to a JSON-serializable representation"""
        if isinstance(val, (int, float, bool, str)):
            return val
        elif isinstance(val, (list, tuple, set)):
            return [self._serialize_value(x) for x in val]
        elif isinstance(val, dict):
            return {str(k): self._serialize_value(v) for k, v in val.items()}
        elif val is None:
            return None
        return str(val)  # fallback for other types

    def _get_delta(self, prev, curr):
        """Calculate delta between previous and current values"""
        delta = None
        if isinstance(curr, dict):
            was_none = False
            if prev is None:
                was_none = True
                prev = {}
            # Compare dictionaries
            changed_keys = {}
            for k, v in curr.items():
                # new variable, we still have to recurse to bottom
                if k not in prev:
                    changed_keys[k] = self._get_delta(None, curr[k])
                # changed variable
                else:
                    maybe_delta = self._get_delta(prev[k], curr[k])
                    if maybe_delta is not None:
                        changed_keys[k] = maybe_delta
            # if something changed, we can assign the delta
            if changed_keys:
                delta = changed_keys
            # if there was nothing previously, assigning something still counts
            elif was_none:
                delta = {}
        elif isinstance(curr, list):
            was_none = False
            if prev is None:
                was_none = True
                prev = []
            changed_keys = {}
            # detect changes in the same index
            for i in range(min(len(curr), len(prev))):
                maybe_delta = self._get_delta(prev[i], curr[i])
                if maybe_delta is not None:
                    changed_keys[i] = maybe_delta
            # assign extra values
            if len(curr) > len(prev):
                for i in range(len(prev), len(curr)):
                    changed_keys[i] = self._get_delta(None, curr[i])
            if changed_keys:
                delta = changed_keys
            # if there was nothing previously, assigning something still counts
            elif was_none:
                delta = []
        elif curr != prev:
            # Changed primitive value
            delta = curr
        return delta

    def run_code(self, code: str, entrypoint: str = None, **kwargs):
        """Run code with expression tracking"""
        self.source_code = code
        self.entrypoint = entrypoint
        self.inputs = kwargs
        
        # Transform the AST for execution
        tree = self.transformer.transform(code)
        
        namespace = {
            '__name__': '__main__',
            '__file__': '<string>',
            '__builtins__': __builtins__,
        }
        
        compiled = compile(tree, '<string>', 'exec')
        exec(compiled, namespace)
        
        # If entrypoint is specified, call the function with kwargs
        if entrypoint and entrypoint in namespace:
            self.result = namespace[entrypoint](**kwargs)
        
        return tree

    def save_results(self, filename: str, transformed_ast):
        """Save results to a JSON file with steps grouped by line number"""
        print(f"Total steps recorded: {len(self.steps)}")
        
        # Analyze relationships from the original AST (before transformation)
        original_ast = ast.parse(self.source_code)
        relationships = self.relationship_analyzer.analyze_ast(original_ast)
        print(f"Found {len(relationships)} relationships")
        
        trace = []
        current_line = None
        current_steps = []
        line_locals = {}
        prev_locals = {}  # Track previous locals for delta calculation
        
        def _create_trace_entry(line, locals, steps):
            # Calculate delta from previous locals
            delta = self._get_delta(prev_locals, locals)
            
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
            
            if current_line != line:
                if current_steps:
                    trace.append(_create_trace_entry(current_line, line_locals, current_steps))
                current_line = line
                current_steps = []
                prev_locals = line_locals.copy()  # Save previous line's locals
                line_locals = step["locals"]
            current_steps.append(step)
        
        if current_steps:
            trace.append(_create_trace_entry(current_line, line_locals, current_steps))
            
        print(f"Generated {len(trace)} trace entries")

        # Use the transformed AST but filter out marker nodes
        json_ast = self.transformer.ast_to_dict(transformed_ast, self.source_code)
        
        with open(filename, 'w') as f:
            json.dump({
                'metadata': {
                    'code': self.source_code,
                    'function': getattr(self, 'entrypoint', None),
                    'inputs': {
                        'kwargs': {k: repr(v) for k, v in getattr(self, 'inputs', {}).items()}
                    }
                },
                'ast': json_ast,
                'relationships': relationships,
                'trace': trace,
                'result': self._serialize_value(self.result)
            }, f, indent=2) 