import ast

class RelationshipAnalyzer:
    """Analyzes AST to identify relationships between container objects and key-like primitives"""
    
    def __init__(self):
        self.relationships = []
        self.variable_types = {}  # Track inferred variable types
        
    def reset(self):
        """Reset the analyzer's state"""
        self.relationships = []
        self.variable_types = {}
        
    def analyze_ast(self, root):
        """Analyze the AST to find container-cursor relationships"""
        self.reset()
        
        # First pass: infer variable types from their usage
        self._infer_variable_types(root)
        
        # Second pass: analyze relationships only for container-cursor pairs
        for node in ast.walk(root):
            if isinstance(node, ast.Subscript):
                self._analyze_subscript(node)
            elif isinstance(node, ast.For):
                self._analyze_for_loop(node)
            elif isinstance(node, ast.Compare):
                self._analyze_membership_test(node)
                    
        return self.relationships
        
    def _infer_variable_types(self, root):
        """Infer variable types from their usage patterns"""
        for node in ast.walk(root):
            # Variables assigned to container literals
            if isinstance(node, ast.Assign):
                if len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
                    var_name = node.targets[0].id
                    if isinstance(node.value, (ast.List, ast.Tuple)):
                        self.variable_types[var_name] = 'list'
                    elif isinstance(node.value, ast.Dict):
                        self.variable_types[var_name] = 'dict'
                    elif isinstance(node.value, ast.Set):
                        self.variable_types[var_name] = 'set'
                        
            # Variables used as containers in subscript operations
            elif isinstance(node, ast.Subscript) and isinstance(node.value, ast.Name):
                container_name = node.value.id
                if container_name not in self.variable_types:
                    # Infer container type from context
                    self.variable_types[container_name] = 'container'
                    
            # Variables used as iterables in for loops
            elif isinstance(node, ast.For):
                if isinstance(node.iter, ast.Name):
                    container_name = node.iter.id
                    if container_name not in self.variable_types:
                        self.variable_types[container_name] = 'iterable'
                elif isinstance(node.iter, ast.Call) and isinstance(node.iter.func, ast.Name):
                    if node.iter.func.id == 'enumerate' and len(node.iter.args) > 0:
                        if isinstance(node.iter.args[0], ast.Name):
                            container_name = node.iter.args[0].id
                            if container_name not in self.variable_types:
                                self.variable_types[container_name] = 'iterable'
                                
            # Variables used in membership tests (in/not in)
            elif isinstance(node, ast.Compare):
                if len(node.ops) == 1 and isinstance(node.ops[0], (ast.In, ast.NotIn)):
                    if len(node.comparators) == 1 and isinstance(node.comparators[0], ast.Name):
                        container_name = node.comparators[0].id
                        if container_name not in self.variable_types:
                            self.variable_types[container_name] = 'container'
                            
    def _is_container_variable(self, var_name):
        """Check if a variable is likely a container"""
        var_type = self.variable_types.get(var_name)
        return var_type in ['list', 'dict', 'set', 'container', 'iterable']
        
    def _is_cursor_variable(self, var_name):
        """Check if a variable is likely a cursor/key (used for indexing)"""
        # For now, we'll be permissive and allow any variable as a cursor
        # In practice, cursors are often integers (i, j, index) or keys
        return True
        
    def _analyze_subscript(self, node):
        """Analyze subscript operations like container[key]"""
        if not isinstance(node.value, ast.Name):
            return
            
        container_name = node.value.id
        
        # Only proceed if container is actually a container-like object
        if not self._is_container_variable(container_name):
            return
            
        # Skip if this is an assignment target (e.g., container[key] = value)
        if isinstance(node.ctx, ast.Store):
            # This is actually a container-cursor relationship for assignment
            if isinstance(node.slice, ast.Name):
                cursor_name = node.slice.id
                if self._is_cursor_variable(cursor_name):
                    self._add_relationship(container_name, cursor_name, 'key_assignment')
            return
            
        # Analyze the slice/index for read operations
        if isinstance(node.slice, ast.Name):
            cursor_name = node.slice.id
            if self._is_cursor_variable(cursor_name):
                self._add_relationship(container_name, cursor_name, 'key_access')
        elif isinstance(node.slice, ast.BinOp):
            # Handle cases like arr[i+1], arr[i-1]
            self._analyze_binary_operation_in_slice(container_name, node.slice)
            
    def _analyze_binary_operation_in_slice(self, container_name, binop_node):
        """Analyze binary operations used in slicing like arr[i+1]"""
        if isinstance(binop_node.left, ast.Name):
            cursor_name = binop_node.left.id
            if self._is_cursor_variable(cursor_name):
                self._add_relationship(container_name, cursor_name, 'key_offset')
        if isinstance(binop_node.right, ast.Name):
            cursor_name = binop_node.right.id
            if self._is_cursor_variable(cursor_name):
                self._add_relationship(container_name, cursor_name, 'key_offset')
            
    def _analyze_for_loop(self, node):
        """Analyze for loops to identify iteration patterns"""
        # Container is always in the iter part
        container_node = node.iter
        target_node = node.target
        
        if isinstance(container_node, ast.Name):
            # Simple iteration: for item in container
            container_name = container_node.id
            if self._is_container_variable(container_name):
                if isinstance(target_node, ast.Name):
                    cursor_name = target_node.id
                    self._add_relationship(container_name, cursor_name, 'value_access')
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
            
            # Only proceed if it's actually a container
            if not self._is_container_variable(container_name):
                return
            
            # Handle tuple unpacking: for i, item in enumerate(container)
            if isinstance(target_node, ast.Tuple) and len(target_node.elts) == 2:
                if isinstance(target_node.elts[0], ast.Name) and isinstance(target_node.elts[1], ast.Name):
                    index_name = target_node.elts[0].id
                    value_name = target_node.elts[1].id
                    
                    self._add_relationship(container_name, index_name, 'key_access')
                    self._add_relationship(container_name, value_name, 'value_access')
                    
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
                            if self._is_container_variable(container_name):
                                self._add_relationship(container_name, cursor_name, 'key_access')
                            
    def _analyze_zip_in_for(self, zip_call, target_node):
        """Analyze zip() calls in for loops"""
        if isinstance(target_node, ast.Tuple):
            # for a, b in zip(container1, container2)
            for i, arg in enumerate(zip_call.args):
                if isinstance(arg, ast.Name) and i < len(target_node.elts):
                    if isinstance(target_node.elts[i], ast.Name):
                        container_name = arg.id
                        cursor_name = target_node.elts[i].id
                        if self._is_container_variable(container_name):
                            self._add_relationship(container_name, cursor_name, 'value_access')
                        
    def _analyze_reversed_in_for(self, reversed_call, target_node):
        """Analyze reversed() calls in for loops"""
        if len(reversed_call.args) > 0 and isinstance(reversed_call.args[0], ast.Name):
            container_name = reversed_call.args[0].id
            if self._is_container_variable(container_name):
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
                
                # Only create relationship if container is actually a container
                if self._is_container_variable(container_name) and self._is_cursor_variable(cursor_name):
                    self._add_relationship(container_name, cursor_name, 'membership_test')
                
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