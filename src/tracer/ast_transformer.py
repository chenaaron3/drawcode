import ast

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
        
    def get_node_id(self, node, problem_key=None):
        """Get a unique ID for an AST node"""
        node_id = getattr(node, '_tracer_id', None)
        pk = getattr(node, '_problem_key', None)
        # reset for new problem, since the node_id carries over to the next problem
        if pk is not None and problem_key is not None and pk != problem_key:
            node_id = None

        if node_id is None:
            node_id = self.node_id_counter
            self.node_id_counter += 1
            setattr(node, '_tracer_id', node_id)
            setattr(node, '_problem_key', problem_key)
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
                        child_dict = self.ast_to_dict(item, source_lines)
                        if child_dict is not None:
                            children.append(item)
                            field_values.append(child_dict)
                    fields[field] = field_values
                else:
                    child_dict = self.ast_to_dict(value, source_lines)
                    if child_dict is not None:
                        children.append(value)
                        fields[field] = child_dict
            
            node_info = {
                "node_id": node_id,
                "children_node_ids": [self.get_node_id(child) for child in children if isinstance(child, ast.AST) and self.get_node_id(child) is not None],
                "type": node.__class__.__name__,
            }

            if parent and self.get_node_id(parent) is not None:
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
        
        # Skip assignment targets, function parameters, and function names
        if self._is_assignment_target(node) or self._is_function_parameter(node) or self._is_function_name(node):
            return node
        
        # Skip constants (int, float, str, bool, None, etc.)
        if isinstance(node, ast.Constant):
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
            
        # Check for subscript in Store/Del context (e.g., freq[num] = 1 or del dict[key])
        # BUT allow the slice to be evaluated since it needs to be computed (except in Del context)
        if isinstance(node, ast.Subscript) and isinstance(node.ctx, (ast.Store, ast.Del)):
            return True
            
        # Check for attribute in Store/Del context (e.g., obj.attr = value or del obj.attr)
        # BUT allow the object to be evaluated since it needs to be accessed (except in Del context)
        if isinstance(node, ast.Attribute) and isinstance(node.ctx, (ast.Store, ast.Del)):
            return True
            
        # Special case: if we're the slice of a subscript in Store context,
        # we should still be evaluated (e.g., the 'num' in 'num_to_index[num] = i')
        # BUT for Del context, we must NOT evaluate anything to keep it a valid target
        parent = getattr(node, 'parent', None)
        if parent and isinstance(parent, ast.Subscript):
            if isinstance(parent.ctx, ast.Store):
                if parent.slice == node:
                    return False  # Allow evaluation of the slice
                # Also allow evaluation of the container part (e.g., 'num_to_index' in 'num_to_index[num] = i')
                if parent.value == node:
                    return False  # Allow evaluation of the container
            elif isinstance(parent.ctx, ast.Del):
                # For Del context, we must not wrap any part to keep it a valid del target
                return True
                
        # Special case: if we're the object of an attribute in Store context,
        # we should still be evaluated (e.g., the 'self' in 'self.left = value')
        # BUT for Del context, we must NOT evaluate anything to keep it a valid target
        if parent and isinstance(parent, ast.Attribute):
            if isinstance(parent.ctx, ast.Store):
                if parent.value == node:
                    return False  # Allow evaluation of the object
            elif isinstance(parent.ctx, ast.Del):
                # For Del context, we must not wrap any part to keep it a valid del target
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
        
    def _is_function_name(self, node):
        """Check if a node is a function name that shouldn't be evaluated"""
        if not isinstance(node, ast.Name):
            return False
            
        parent = getattr(node, "parent", None)
        if not parent:
            return False
            
        # Check if we're the function name in a function call
        if isinstance(parent, ast.Call) and parent.func == node:
            return True
            
        # Check if we're part of a method call
        # Examples:
        # 1. obj.method() - 'method' is the attribute name
        # 2. my_list.append(x) - 'append' is the attribute name
        # 3. "hello".upper() - 'upper' is the attribute name
        # 4. self.process() - 'self' is the object being called on
        # 5. my_dict.update({}) - both 'my_dict' and 'update' are checked
        if isinstance(parent, ast.Attribute):
            grandparent = getattr(parent, "parent", None)
            if grandparent and isinstance(grandparent, ast.Call) and grandparent.func == parent:
                # Return True if we're either:
                # 1. The attribute name (method) in a method call
                # 2. The object the method is being called on
                return parent.attr == node.id or parent.value == node
                    
        return False
        
    def visit(self, node):
        """Visit a node"""
        if isinstance(node, ast.stmt):
            return self.visit_stmt(node)
        elif isinstance(node, ast.expr):
            return self.visit_expr(node)
        else:
            return self.generic_visit(node)
            
    def transform(self, source, problem_key):
        """Transform source code by adding marker function calls"""
        root = ast.parse(source)
        
        # First assign IDs to all nodes. We need to do this before installing markers so they don't get IDs
        for node in ast.walk(root):
            if isinstance(node, ast.AST):
                self.get_node_id(node, problem_key)
                
            # Set parent for all AST nodes for context detection
            for child in ast.iter_child_nodes(node):
                setattr(child, "parent", node)
        
        # Transform the AST with markers
        root = self.visit(root)
        
        # Handle top-level statements in Module to flatten the AST
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

    def _is_marker_node(self, node):
        """Check if a node is a marker function call that should not get a node ID"""
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            if isinstance(node.value.func, ast.Name):
                func_name = node.value.func.id
                return func_name in [BEFORE_STATEMENT_MARKER, AFTER_STATEMENT_MARKER]
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            func_name = node.func.id
            return func_name in [BEFORE_EXPRESSION_MARKER, AFTER_EXPRESSION_MARKER]
        return False

    def unwrap_transformed_ast(self, transformed_ast):
        """Unwrap a transformed AST back to original structure while preserving node IDs"""
        unwrapped = self._unwrap_ast_node(transformed_ast)
        
        # Set up parent relationships for the unwrapped AST
        for node in ast.walk(unwrapped):
            for child in ast.iter_child_nodes(node):
                setattr(child, 'parent', node)
                
        return unwrapped
    
    def _unwrap_ast_node(self, node):
        """Recursively unwrap AST nodes, removing markers but preserving structure and node IDs"""
        if not isinstance(node, ast.AST):
            return node
            
        # Handle marker nodes by unwrapping them
        if self._is_marker_node(node):
            if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
                # Statement marker: skip it entirely
                return None
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                func_name = node.func.id
                if func_name == AFTER_EXPRESSION_MARKER:
                    # Expression marker: unwrap to get the original expression
                    if len(node.args) >= 2:
                        # The second argument is the original expression
                        return self._unwrap_ast_node(node.args[1])
                elif func_name == BEFORE_EXPRESSION_MARKER:
                    # Before expression marker: skip it
                    return None
            return None
        
        # For regular nodes, create a copy and recursively unwrap children
        # Create a new node of the same type
        new_node = type(node)()
        
        # Copy the node ID if it exists
        if hasattr(node, '_tracer_id'):
            setattr(new_node, '_tracer_id', node._tracer_id)
            
        # Copy location information
        for attr in ['lineno', 'col_offset', 'end_lineno', 'end_col_offset']:
            if hasattr(node, attr):
                setattr(new_node, attr, getattr(node, attr))
        
        # Recursively unwrap all fields
        for field, value in ast.iter_fields(node):
            if isinstance(value, list):
                new_list = []
                for item in value:
                    unwrapped = self._unwrap_ast_node(item)
                    if unwrapped is not None:
                        new_list.append(unwrapped)
                setattr(new_node, field, new_list)
            else:
                unwrapped = self._unwrap_ast_node(value)
                if unwrapped is not None:
                    setattr(new_node, field, unwrapped)
                elif not isinstance(value, ast.AST):
                    # Keep non-AST values (strings, numbers, etc.)
                    setattr(new_node, field, value)
        
        return new_node 