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

class RelationshipAnalyzer:
    """Analyzes AST to identify relationships between primitive variables and containers"""
    
    def __init__(self):
        self.relationships = []
        self.variable_assignments = {}  # Track variable assignments
        self.function_calls = {}  # Track function call relationships
        
    def reset(self):
        """Reset the analyzer's state"""
        self.relationships = []
        self.variable_assignments = {}
        self.function_calls = {}
        
    def analyze_ast(self, root):
        """Analyze the AST to find various relationships"""
        self.reset()
        
        # Single pass to analyze all relationships
        for node in ast.walk(root):
            if isinstance(node, ast.Subscript):
                self._analyze_subscript(node)
            elif isinstance(node, ast.For):
                self._analyze_for_loop(node)
            elif isinstance(node, ast.Compare):
                self._analyze_membership_test(node)
            elif isinstance(node, ast.Assign):
                self._analyze_assignment(node)
            elif isinstance(node, ast.AugAssign):
                self._analyze_augmented_assignment(node)
            elif isinstance(node, ast.Call):
                self._analyze_function_call(node)
            elif isinstance(node, ast.ListComp):
                self._analyze_list_comprehension(node)
            elif isinstance(node, ast.DictComp):
                self._analyze_dict_comprehension(node)
                    
        return self.relationships
        
    def _analyze_subscript(self, node):
        """Analyze subscript operations like container[key]"""
        if not isinstance(node.value, ast.Name):
            return
            
        container_name = node.value.id
        
        # Skip if this is an assignment target (e.g., container[key] = value)
        if isinstance(node.ctx, ast.Store):
            # This is actually a container-cursor relationship for assignment
            if isinstance(node.slice, ast.Name):
                cursor_name = node.slice.id
                self._add_relationship(container_name, cursor_name, 'key_assignment')
            return
            
        # Analyze the slice/index for read operations
        if isinstance(node.slice, ast.Name):
            cursor_name = node.slice.id
            self._add_relationship(container_name, cursor_name, 'key')
        elif isinstance(node.slice, ast.BinOp):
            # Handle cases like arr[i+1], arr[i-1]
            self._analyze_binary_operation_in_slice(node.value.id, node.slice)
            
    def _analyze_binary_operation_in_slice(self, container_name, binop_node):
        """Analyze binary operations used in slicing like arr[i+1]"""
        if isinstance(binop_node.left, ast.Name):
            cursor_name = binop_node.left.id
            self._add_relationship(container_name, cursor_name, 'key_offset')
        if isinstance(binop_node.right, ast.Name):
            cursor_name = binop_node.right.id
            self._add_relationship(container_name, cursor_name, 'key_offset')
            
    def _analyze_for_loop(self, node):
        """Analyze for loops to identify iteration patterns"""
        # Container is always in the iter part
        container_node = node.iter
        target_node = node.target
        
        if isinstance(container_node, ast.Name):
            # Simple iteration: for item in container
            container_name = container_node.id
            if isinstance(target_node, ast.Name):
                cursor_name = target_node.id
                self._add_relationship(container_name, cursor_name, 'value')
        elif isinstance(container_node, ast.Call):
            # Handle function calls like enumerate, range, zip, etc.
            if isinstance(container_node.func, ast.Name):
                func_name = container_node.func.id
                if func_name == 'enumerate':
                    self._analyze_enumerate_in_for(container_node, target_node)
                elif func_name == 'range':
                    self._analyze_range_in_for(container_node, target_node)
                elif func_name == 'zip':
                    self._analyze_zip_in_for(container_node, target_node)
                elif func_name == 'reversed':
                    self._analyze_reversed_in_for(container_node, target_node)
                    
    def _analyze_enumerate_in_for(self, enumerate_call, target_node):
        """Analyze enumerate() calls in for loops"""
        if len(enumerate_call.args) > 0 and isinstance(enumerate_call.args[0], ast.Name):
            container_name = enumerate_call.args[0].id
            
            # Handle tuple unpacking: for i, item in enumerate(container)
            if isinstance(target_node, ast.Tuple) and len(target_node.elts) == 2:
                if isinstance(target_node.elts[0], ast.Name) and isinstance(target_node.elts[1], ast.Name):
                    index_name = target_node.elts[0].id
                    value_name = target_node.elts[1].id
                    
                    self._add_relationship(container_name, index_name, 'key')
                    self._add_relationship(container_name, value_name, 'value')
                    
    def _analyze_range_in_for(self, range_call, target_node):
        """Analyze range() calls in for loops"""
        if isinstance(target_node, ast.Name):
            cursor_name = target_node.id
            
            # Check if range uses len(container)
            for arg in range_call.args:
                if isinstance(arg, ast.Call) and isinstance(arg.func, ast.Name):
                    if arg.func.id == 'len' and len(arg.args) > 0:
                        if isinstance(arg.args[0], ast.Name):
                            container_name = arg.args[0].id
                            self._add_relationship(container_name, cursor_name, 'key')
                            
    def _analyze_zip_in_for(self, zip_call, target_node):
        """Analyze zip() calls in for loops"""
        if isinstance(target_node, ast.Tuple):
            # for a, b in zip(container1, container2)
            for i, arg in enumerate(zip_call.args):
                if isinstance(arg, ast.Name) and i < len(target_node.elts):
                    if isinstance(target_node.elts[i], ast.Name):
                        container_name = arg.id
                        cursor_name = target_node.elts[i].id
                        self._add_relationship(container_name, cursor_name, 'value')
                        
    def _analyze_reversed_in_for(self, reversed_call, target_node):
        """Analyze reversed() calls in for loops"""
        if len(reversed_call.args) > 0 and isinstance(reversed_call.args[0], ast.Name):
            container_name = reversed_call.args[0].id
            if isinstance(target_node, ast.Name):
                cursor_name = target_node.id
                self._add_relationship(container_name, cursor_name, 'value_reversed')
                    
    def _analyze_membership_test(self, node):
        """Analyze membership tests like 'key in container'"""
        if len(node.ops) != 1 or len(node.comparators) != 1:
            return
            
        # Handle 'key in container' pattern
        if isinstance(node.ops[0], (ast.In, ast.NotIn)):
            if isinstance(node.left, ast.Name) and isinstance(node.comparators[0], ast.Name):
                cursor_name = node.left.id  # The key being tested
                container_name = node.comparators[0].id  # The container being tested against
                self._add_relationship(container_name, cursor_name, 'membership_test')
                
    def _analyze_assignment(self, node):
        """Analyze assignment operations to track variable relationships"""
        if len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            target_name = node.targets[0].id
            
            # Track what this variable is assigned from
            if isinstance(node.value, ast.Name):
                # Simple assignment: a = b
                source_name = node.value.id
                self._add_relationship(source_name, target_name, 'assignment')
            elif isinstance(node.value, ast.BinOp):
                # Binary operation: c = a + b
                self._analyze_binary_operation_assignment(target_name, node.value)
            elif isinstance(node.value, ast.Call):
                # Function call assignment: result = func(args)
                self._analyze_function_call_assignment(target_name, node.value)
            elif isinstance(node.value, ast.Subscript):
                # Subscript assignment: val = container[key]
                self._analyze_subscript_assignment(target_name, node.value)
                
    def _analyze_binary_operation_assignment(self, target_name, binop_node):
        """Analyze binary operations in assignments"""
        left_vars = self._extract_variable_names(binop_node.left)
        right_vars = self._extract_variable_names(binop_node.right)
        
        for var in left_vars + right_vars:
            self._add_relationship(var, target_name, 'derived_from')
            
    def _analyze_function_call_assignment(self, target_name, call_node):
        """Analyze function calls in assignments"""
        if isinstance(call_node.func, ast.Name):
            func_name = call_node.func.id
            
            # Extract variables from arguments and relate them to the target variable
            for arg in call_node.args:
                arg_vars = self._extract_variable_names(arg)
                for var in arg_vars:
                    # Only create relationships between actual variables
                    if var != target_name:  # Avoid self-relationships
                        self._add_relationship(var, target_name, f'function_input_{func_name}')
        elif isinstance(call_node.func, ast.Attribute):
            # Method call assignment like result = obj.method()
            if isinstance(call_node.func.value, ast.Name):
                object_name = call_node.func.value.id
                method_name = call_node.func.attr
                
                # Create relationship between object and result
                self._add_relationship(object_name, target_name, f'method_{method_name}_result')
                
                # Extract variables from arguments
                for arg in call_node.args:
                    arg_vars = self._extract_variable_names(arg)
                    for var in arg_vars:
                        if var != target_name and var != object_name:
                            self._add_relationship(var, target_name, f'method_{method_name}_input')
                    
    def _analyze_subscript_assignment(self, target_name, subscript_node):
        """Analyze subscript operations in assignments"""
        if isinstance(subscript_node.value, ast.Name):
            container_name = subscript_node.value.id
            self._add_relationship(container_name, target_name, 'extracted_from')
            
            if isinstance(subscript_node.slice, ast.Name):
                cursor_name = subscript_node.slice.id
                self._add_relationship(cursor_name, target_name, 'indexed_by')
                
    def _analyze_augmented_assignment(self, node):
        """Analyze augmented assignments like +=, -=, etc."""
        if isinstance(node.target, ast.Name):
            target_name = node.target.id
            value_vars = self._extract_variable_names(node.value)
            
            for var in value_vars:
                self._add_relationship(var, target_name, 'augmented_by')
                
    def _analyze_function_call(self, node):
        """Analyze function calls to identify relationships"""
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
            
            # Extract variables from arguments and relate them to a result variable
            # Only create relationships if we're in an assignment context
            # This will be handled by _analyze_function_call_assignment instead
            
            # Special handling for common functions
            if func_name == 'len' and len(node.args) == 1:
                if isinstance(node.args[0], ast.Name):
                    container_name = node.args[0].id
                    # This creates a relationship that len() operates on the container
                    pass
        elif isinstance(node.func, ast.Attribute):
            # Method calls like obj.method()
            self._analyze_method_call(node)
            
    def _analyze_method_call(self, node):
        """Analyze method calls to identify relationships"""
        if isinstance(node.func.value, ast.Name):
            object_name = node.func.value.id
            method_name = node.func.attr
            
            # Extract variables from arguments
            for arg in node.args:
                arg_vars = self._extract_variable_names(arg)
                for var in arg_vars:
                    # Only create relationships between variables
                    if var != object_name:  # Avoid self-relationships
                        self._add_relationship(object_name, var, f'method_{method_name}_input')
                    
            # Special method handling
            if method_name in ['append', 'extend', 'insert']:
                # Container modification methods
                for arg in node.args:
                    arg_vars = self._extract_variable_names(arg)
                    for var in arg_vars:
                        if var != object_name:  # Avoid self-relationships
                            self._add_relationship(object_name, var, 'container_modification')
            elif method_name in ['get', 'setdefault']:
                # Dictionary access methods
                if len(node.args) > 0:
                    key_vars = self._extract_variable_names(node.args[0])
                    for var in key_vars:
                        if var != object_name:  # Avoid self-relationships
                            self._add_relationship(object_name, var, 'dict_key_access')
                
    def _analyze_list_comprehension(self, node):
        """Analyze list comprehensions to identify relationships"""
        # Analyze the iterator
        if isinstance(node.generators[0].iter, ast.Name):
            container_name = node.generators[0].iter.id
            if isinstance(node.generators[0].target, ast.Name):
                cursor_name = node.generators[0].target.id
                self._add_relationship(container_name, cursor_name, 'comprehension_iter')
                    
    def _analyze_dict_comprehension(self, node):
        """Analyze dictionary comprehensions to identify relationships"""
        # Analyze the iterator
        if isinstance(node.generators[0].iter, ast.Name):
            container_name = node.generators[0].iter.id
            if isinstance(node.generators[0].target, ast.Name):
                cursor_name = node.generators[0].target.id
                self._add_relationship(container_name, cursor_name, 'comprehension_iter')
                    
    def _extract_variable_names(self, node):
        """Extract all variable names from an AST node"""
        variables = []
        if isinstance(node, ast.Name):
            variables.append(node.id)
        elif hasattr(node, '__dict__'):
            for child in ast.iter_child_nodes(node):
                variables.extend(self._extract_variable_names(child))
        return variables
                
    def _add_relationship(self, container, cursor, rel_type):
        """Add a relationship if it doesn't already exist"""
        relationship = {
            'container': container,
            'cursor': cursor,
            'type': rel_type
        }
        
        # Avoid duplicates
        if relationship not in self.relationships:
            self.relationships.append(relationship)

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
            parent = getattr(node, "parent", None)
            
            fields = {}
            children = []
            # collect children values
            for field, value in ast.iter_fields(node):
                if isinstance(value, list):
                    field_values = []
                    for item in value:
                        children.append(item)
                        field_values.append(self.ast_to_dict(item, source_lines))
                    fields[field] = field_values
                else:
                    children.append(value)
                    fields[field] = self.ast_to_dict(value, source_lines)
            
            node_info = {
                "node_id": node_id,
                "children_node_ids": [self.get_node_id(child) for child in children if isinstance(child, ast.AST)],
                "type": node.__class__.__name__,
            }

            if parent:
                node_info['parent_node_id'] = self.get_node_id(parent)
            
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
