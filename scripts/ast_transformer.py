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