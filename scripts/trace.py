import sys
import json
import ast
import builtins
import os

# Marker function names - using same names as Thonny for consistency
BEFORE_STATEMENT_MARKER = "_thonny_hidden_before_stmt"
AFTER_STATEMENT_MARKER = "_thonny_hidden_after_stmt"  
BEFORE_EXPRESSION_MARKER = "_thonny_hidden_before_expr"
AFTER_EXPRESSION_MARKER = "_thonny_hidden_after_expr"

class ASTTransformer(ast.NodeTransformer):
    """Handles AST transformation and node tracking"""
    def __init__(self):
        self.reset()
        
    def reset(self):
        """Reset the transformer's state"""
        self.node_id_counter = 0
        self._nodes = {}  # node_id -> node mapping
        
    def get_node_id(self, node):
        """Get a unique ID for an AST node"""
        node_id = getattr(node, '_tracer_id', None)
        if node_id is None:
            node_id = self.node_id_counter
            self.node_id_counter += 1
            setattr(node, '_tracer_id', node_id)
            self._nodes[node_id] = node
        return node_id
        
    def get_node(self, node_id):
        """Get node by ID, returns None if not found"""
        return self._nodes.get(node_id)
        
    def ast_to_dict(self, node, source_lines=None):
        """Convert AST node to dict while maintaining structure and node IDs"""
        if isinstance(node, ast.AST):
            node_id = self.get_node_id(node)
            
            fields = {}
            for field, value in ast.iter_fields(node):
                if isinstance(value, list):
                    fields[field] = [self.ast_to_dict(item, source_lines) for item in value]
                else:
                    fields[field] = self.ast_to_dict(value, source_lines)
                    
            node_info = {
                "node_id": node_id,
                "type": node.__class__.__name__,
            }
            
            # Add location info if available
            if hasattr(node, 'lineno'):
                node_info["location"] = {
                    "lineno": node.lineno,
                    "col_offset": node.col_offset,
                    "end_lineno": node.end_lineno,
                    "end_col_offset": node.end_col_offset
                }
                # Add source code segment if location is available
                if source_lines:
                    focus = ast.get_source_segment(''.join(source_lines), node)
                    if focus:
                        node_info["focus"] = focus
            
            # Add other fields
            node_info.update(fields)
            return node_info
        elif isinstance(node, (str, int, float, bool, type(None))):
            return node
        else:
            return str(node)
            
    def visit_stmt(self, node):
        """Visit a statement node"""
        if not isinstance(node, ast.stmt):
            return self.generic_visit(node)
            
        # Transform child nodes first
        node = self.generic_visit(node)
        
        node_id = self.get_node_id(node)
        before_marker = ast.Expr(
            value=ast.Call(
                func=ast.Name(id=BEFORE_STATEMENT_MARKER, ctx=ast.Load()),
                args=[ast.Constant(value=node_id)],
                keywords=[]
            )
        )
        
        after_marker = ast.Expr(
            value=ast.Call(
                func=ast.Name(id=AFTER_STATEMENT_MARKER, ctx=ast.Load()),
                args=[ast.Constant(value=node_id)],
                keywords=[]
            )
        )
        
        # # For control flow statements (if, for, while), wrap the entire statement
        # # to capture the decision/iteration logic
        # if isinstance(node, (ast.If, ast.For, ast.While)):
        #     return [before_marker, node, after_marker]
        # # For compound statements with bodies (function/class definitions), 
        # # wrap their body to trace execution inside
        # elif hasattr(node, 'body'):
        #     if isinstance(node.body, list):
        #         node.body = [before_marker] + node.body + [after_marker]
        #     else:
        #         node.body = [before_marker, node.body, after_marker]
        #     return node
        
        # # For simple statements, wrap in a list
        # else:
        #     return [before_marker, node, after_marker]

        # For all statements, wrap with before/after markers
        return [before_marker, node, after_marker]
        
    def visit_expr(self, node):
        """Visit an expression node"""
        if not isinstance(node, ast.expr) or not hasattr(node, "lineno"):
            return self.generic_visit(node)
            
        # Transform child nodes first
        node = self.generic_visit(node)
        
        # Check if this node or any of its ancestors is in a Store/Del context
        if self._is_assignment_target(node):
            return node
        
        # Skip function/lambda parameters
        if self._is_function_parameter(node):
            return node
        
        # Wrap with markers inline - only expressions being evaluated
        node_id = self.get_node_id(node)
        return ast.Call(
            func=ast.Name(id=AFTER_EXPRESSION_MARKER, ctx=ast.Load()),
            args=[
                ast.Call(
                    func=ast.Name(id=BEFORE_EXPRESSION_MARKER, ctx=ast.Load()),
                    args=[ast.Constant(value=node_id)],
                    keywords=[]
                ),
                node
            ],
            keywords=[]
        )
    
    def _is_assignment_target(self, node):
        """Check if a node is an assignment target (being stored to, not evaluated)"""
        # Direct check for Store/Del context
        if isinstance(node, ast.Name) and isinstance(node.ctx, (ast.Store, ast.Del)):
            return True
            
        # Check for subscript in Store context (e.g., freq[num] = 1)
        if isinstance(node, ast.Subscript) and isinstance(node.ctx, ast.Store):
            return True
            
        # Check if we're inside a Store context (for complex targets like tuple unpacking)
        current = node
        while hasattr(current, 'parent'):
            parent = current.parent
            
            # If parent is a tuple/list in Store context, we're an assignment target
            if isinstance(parent, (ast.Tuple, ast.List)) and isinstance(parent.ctx, ast.Store):
                return True
                
            # If parent is an assignment and we're in the targets
            if isinstance(parent, ast.Assign) and current in parent.targets:
                return True
                
            # If parent is an augmented assignment and we're the target
            if isinstance(parent, ast.AugAssign) and current == parent.target:
                return True
                
            # If parent is a for loop and we're the target
            if isinstance(parent, ast.For) and current == parent.target:
                return True
                
            # If parent is a comprehension and we're the target
            if isinstance(parent, ast.comprehension) and current == parent.target:
                return True
                
            # If parent is a with statement and we're the optional_vars
            if isinstance(parent, ast.withitem) and current == parent.optional_vars:
                return True
                
            # If parent is an exception handler and we're the name
            if isinstance(parent, ast.ExceptHandler) and current == parent.name:
                return True
                
            current = parent
            
        return False
    
    def _is_function_parameter(self, node):
        """Check if a node is a function parameter"""
        parent = getattr(node, "parent", None)
        if not parent:
            return False
            
        # Check if we're in function arguments
        if isinstance(parent, ast.arguments):
            return True
            
        # Check if we're lambda arguments
        if isinstance(parent, ast.Lambda) and hasattr(parent, 'args'):
            # Walk through all argument nodes in the lambda
            for arg_node in ast.walk(parent.args):
                if arg_node is node:
                    return True
                    
        return False
        
    def visit(self, node):
        """Visit a node"""
        if isinstance(node, ast.stmt):
            return self.visit_stmt(node)
        elif isinstance(node, ast.expr):
            return self.visit_expr(node)
        else:
            return self.generic_visit(node)
            
    def transform(self, source):
        """Transform source code by adding marker function calls"""
        root = ast.parse(source)
        
        # First assign IDs to all nodes
        for node in ast.walk(root):
            if isinstance(node, ast.AST):
                self.get_node_id(node)
                
            # Set parent for all AST nodes for context detection
            for child in ast.iter_child_nodes(node):
                setattr(child, "parent", node)
        
        # Transform the AST
        root = self.visit(root)
        
        # Handle top-level statements in Module
        if isinstance(root, ast.Module):
            new_body = []
            for node in root.body:
                if isinstance(node, list):
                    new_body.extend(node)
                else:
                    new_body.append(node)
            root.body = new_body
        
        ast.fix_missing_locations(root)
        return root

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
                'trace': trace,
                'result': self._serialize_value(self.result)
            }, f, indent=2)

if __name__ == '__main__':
    PROBLEM_DIR = os.path.abspath(os.path.join(__file__, ".."))
    OUTPUT_DIR = os.path.abspath(os.path.join(__file__, "..", "..", "public", "traces"))
    
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    problems = []
    try:
        with open(os.path.join(PROBLEM_DIR, "problems.json"), "r") as f:
            problems = json.load(f)['problems']
    except FileNotFoundError:
        print("problems.json not found")
    
    tracer = PythonTracer()
    for problem in problems:
        # if problem['id'] != "two-sum":
        #     continue
        print(f"Processing problem {problem['id']}...")
        tracer.reset()  # Reset tracer state for each problem
        transformed_ast = tracer.run_code(problem['solution'], problem['entrypoint'], **problem['inputs'])
        tracer.save_results(os.path.join(OUTPUT_DIR, f"{problem['id']}.json"), transformed_ast)
    print("Done!") 
