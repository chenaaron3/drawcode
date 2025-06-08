import ast

class RelationshipAnalyzer:
    """Analyzes AST to identify relationships between container objects and key-like primitives"""
    
    def __init__(self):
        self.relationships = []
        self.variable_types = {}  # Track inferred variable types
        self.transformer = None  # Will be set when analyzing
        
    def reset(self):
        """Reset the analyzer's state"""
        self.relationships = []
        self.variable_types = {}
        self.transformer = None
        
    def analyze_ast(self, root, transformer=None, manual_relationships=None):
        """Analyze the AST to find container-cursor relationships"""
        self.reset()
        self.transformer = transformer
        self._ast_root = root
        
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
        
        # Add manual relationships if provided
        if manual_relationships:
            self._add_manual_relationships(manual_relationships)
                    
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
        """Check if a variable is likely a cursor/key based on AST usage patterns"""
        # Skip variables that are clearly containers themselves
        if self._is_container_variable(var_name):
            return False
            
        # Use AST analysis to determine if this variable is used as a cursor
        return self._is_used_as_cursor_in_ast(var_name)
        
    def _is_used_as_cursor_in_ast(self, var_name):
        """Analyze AST to see if variable is used in cursor-like patterns"""
        if not hasattr(self, '_ast_root'):
            # If we don't have the AST, be permissive
            return True
            
        cursor_usage_count = 0
        non_cursor_usage_count = 0
        
        for node in ast.walk(self._ast_root):
            if isinstance(node, ast.Name) and node.id == var_name:
                if self._is_cursor_usage_context(node):
                    cursor_usage_count += 1
                elif self._is_non_cursor_usage_context(node):
                    non_cursor_usage_count += 1
                    
        # If variable is used more as a cursor than not, consider it a cursor
        # Also allow if it's only used as cursor (even if just once)
        return cursor_usage_count > 0 and cursor_usage_count >= non_cursor_usage_count
        
    def _is_cursor_usage_context(self, name_node):
        """Check if a Name node is used in a cursor-like context"""
        parent = getattr(name_node, 'parent', None)
        if not parent:
            return False
            
        # Used as array/dict index: container[cursor]
        if isinstance(parent, ast.Subscript) and parent.slice == name_node:
            return True
            
        # Used in range() for iteration: for i in range(...)
        if isinstance(parent, ast.Call) and isinstance(parent.func, ast.Name):
            if parent.func.id == 'range' and name_node in parent.args:
                return True
                
        # Used in len() call: range(len(container))
        grandparent = getattr(parent, 'parent', None)
        if (isinstance(parent, ast.Call) and isinstance(parent.func, ast.Name) and
            parent.func.id == 'len' and isinstance(grandparent, ast.Call) and
            isinstance(grandparent.func, ast.Name) and grandparent.func.id == 'range'):
            return False  # This is the container, not the cursor
            
        # Used in binary operations within subscripts: arr[i+1], arr[i-1]
        if isinstance(parent, ast.BinOp):
            grandparent = getattr(parent, 'parent', None)
            if isinstance(grandparent, ast.Subscript) and grandparent.slice == parent:
                return True
                
        # Used as loop variable in enumerate: for i, item in enumerate(...)
        if isinstance(parent, ast.Tuple):
            grandparent = getattr(parent, 'parent', None)
            if isinstance(grandparent, ast.For) and grandparent.target == parent:
                great_grandparent = grandparent.iter
                if (isinstance(great_grandparent, ast.Call) and 
                    isinstance(great_grandparent.func, ast.Name) and
                    great_grandparent.func.id == 'enumerate'):
                    # First element of tuple in enumerate is typically the index (cursor)
                    if isinstance(parent, ast.Tuple) and len(parent.elts) >= 1:
                        return parent.elts[0] == name_node
                        
        # Used as simple loop variable: for i in range(...)
        if isinstance(parent, ast.For) and parent.target == name_node:
            if (isinstance(parent.iter, ast.Call) and 
                isinstance(parent.iter.func, ast.Name) and
                parent.iter.func.id == 'range'):
                return True
                
        return False
        
    def _is_non_cursor_usage_context(self, name_node):
        """Check if a Name node is used in a non-cursor context"""
        parent = getattr(name_node, 'parent', None)
        if not parent:
            return False
            
        # Used as container in subscript: container[index]
        if isinstance(parent, ast.Subscript) and parent.value == name_node:
            return True
            
        # Used as container in membership test: key in container
        if isinstance(parent, ast.Compare):
            if len(parent.comparators) == 1 and parent.comparators[0] == name_node:
                if len(parent.ops) == 1 and isinstance(parent.ops[0], (ast.In, ast.NotIn)):
                    return True
                    
        # Used as container in iteration: for item in container
        if isinstance(parent, ast.For) and parent.iter == name_node:
            return True
            
        # Used as container in function calls: len(container), enumerate(container)
        if isinstance(parent, ast.Call) and name_node in parent.args:
            if isinstance(parent.func, ast.Name):
                container_functions = {'len', 'enumerate', 'reversed', 'sorted', 'max', 'min', 'sum'}
                if parent.func.id in container_functions:
                    return True
                    
        # Used in arithmetic operations (likely a value, not a cursor)
        if isinstance(parent, ast.BinOp):
            # Unless it's inside a subscript (which we handle in cursor context)
            grandparent = getattr(parent, 'parent', None)
            if not (isinstance(grandparent, ast.Subscript) and grandparent.slice == parent):
                # Also check if it's a simple increment/decrement pattern like i+1, i-1
                # which is still cursor-like behavior
                if isinstance(parent.op, (ast.Add, ast.Sub)):
                    # If the other operand is a small constant, it's likely cursor arithmetic
                    other_operand = parent.right if parent.left == name_node else parent.left
                    if isinstance(other_operand, ast.Constant) and isinstance(other_operand.value, int):
                        if abs(other_operand.value) <= 2:  # i+1, i-1, i+2, etc.
                            return False  # Don't count as non-cursor
                return True
                
        return False
        
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
                    self._add_relationship(container_name, cursor_name, 'key_assignment', node)
            return
            
        # Analyze the slice/index for read operations
        if isinstance(node.slice, ast.Name):
            cursor_name = node.slice.id
            if self._is_cursor_variable(cursor_name):
                self._add_relationship(container_name, cursor_name, 'key_access', node)
        elif isinstance(node.slice, ast.BinOp):
            # Handle cases like arr[i+1], arr[i-1]
            self._analyze_binary_operation_in_slice(container_name, node.slice, node)
            
    def _analyze_binary_operation_in_slice(self, container_name, binop_node, parent_node):
        """Analyze binary operations used in slicing like arr[i+1]"""
        if isinstance(binop_node.left, ast.Name):
            cursor_name = binop_node.left.id
            if self._is_cursor_variable(cursor_name):
                self._add_relationship(container_name, cursor_name, 'key_access', parent_node)
        if isinstance(binop_node.right, ast.Name):
            cursor_name = binop_node.right.id
            if self._is_cursor_variable(cursor_name):
                self._add_relationship(container_name, cursor_name, 'key_access', parent_node)
            
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
                    self._add_relationship(container_name, cursor_name, 'value_index', node)
        elif isinstance(container_node, ast.Call):
            # Handle function calls like enumerate, range, zip, etc.
            if isinstance(container_node.func, ast.Name):
                func_name = container_node.func.id
                if func_name == 'enumerate':
                    self._analyze_enumerate_in_for(container_node, target_node, node)
                elif func_name == 'range':
                    self._analyze_range_in_for(container_node, target_node, node)
                elif func_name == 'zip':
                    self._analyze_zip_in_for(container_node, target_node, node)
                elif func_name == 'reversed':
                    self._analyze_reversed_in_for(container_node, target_node, node)
            elif isinstance(container_node.func, ast.Attribute):
                # Handle method calls like dict.items(), dict.keys(), dict.values()
                self._analyze_dict_method_in_for(container_node, target_node, node)
                    
    def _analyze_enumerate_in_for(self, enumerate_call, target_node, for_node):
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
                    
                    self._add_relationship(container_name, index_name, 'key_index', for_node)
                    self._add_relationship(container_name, value_name, 'value_index', for_node)
                    
    def _analyze_range_in_for(self, range_call, target_node, for_node):
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
                                self._add_relationship(container_name, cursor_name, 'key_index', for_node)
                            
    def _analyze_zip_in_for(self, zip_call, target_node, for_node):
        """Analyze zip() calls in for loops"""
        if isinstance(target_node, ast.Tuple):
            # for a, b in zip(container1, container2)
            for i, arg in enumerate(zip_call.args):
                if isinstance(arg, ast.Name) and i < len(target_node.elts):
                    if isinstance(target_node.elts[i], ast.Name):
                        container_name = arg.id
                        cursor_name = target_node.elts[i].id
                        if self._is_container_variable(container_name):
                            self._add_relationship(container_name, cursor_name, 'value_index', for_node)
                        
    def _analyze_reversed_in_for(self, reversed_call, target_node, for_node):
        """Analyze reversed() calls in for loops"""
        if len(reversed_call.args) > 0 and isinstance(reversed_call.args[0], ast.Name):
            container_name = reversed_call.args[0].id
            if self._is_container_variable(container_name):
                if isinstance(target_node, ast.Name):
                    cursor_name = target_node.id
                    self._add_relationship(container_name, cursor_name, 'value_index', for_node)

    def _analyze_dict_method_in_for(self, method_call, target_node, for_node):
        """Analyze dictionary method calls in for loops like dict.items(), dict.keys(), dict.values()"""
        if not isinstance(method_call.func.value, ast.Name):
            return
            
        container_name = method_call.func.value.id
        method_name = method_call.func.attr
        
        # Only proceed if it's actually a container (likely a dict)
        if not self._is_container_variable(container_name):
            return
            
        if method_name == 'items':
            # for key, value in dict.items()
            if isinstance(target_node, ast.Tuple) and len(target_node.elts) == 2:
                if isinstance(target_node.elts[0], ast.Name) and isinstance(target_node.elts[1], ast.Name):
                    key_name = target_node.elts[0].id
                    value_name = target_node.elts[1].id
                    
                    self._add_relationship(container_name, key_name, 'dict_key', for_node)
                    self._add_relationship(container_name, value_name, 'dict_value', for_node)
        elif method_name == 'keys':
            # for key in dict.keys()
            if isinstance(target_node, ast.Name):
                key_name = target_node.id
                self._add_relationship(container_name, key_name, 'dict_key', for_node)
        elif method_name == 'values':
            # for value in dict.values()
            if isinstance(target_node, ast.Name):
                value_name = target_node.id
                self._add_relationship(container_name, value_name, 'dict_value', for_node)
                    
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
                    self._add_relationship(container_name, cursor_name, 'membership_test', node)
                
    def _add_relationship(self, container, cursor, rel_type, node):
        """Add a relationship if it doesn't already exist and has a valid node_id"""
        # Get the node_id from the node's _tracer_id attribute
        node_id = getattr(node, '_tracer_id', None)
        
        # Only add relationships with valid node IDs
        if node_id is None:
            return
        
        relationship = {
            'container': container,
            'cursor': cursor,
            'type': rel_type,
            'node_id': node_id
        }
        
        # Avoid duplicates
        if relationship not in self.relationships:
            self.relationships.append(relationship)
    
    def _add_manual_relationships(self, manual_relationships):
        """Add manually specified relationships"""
        for manual_rel in manual_relationships:
            # Create a fake node_id for manual relationships (use negative numbers to avoid conflicts)
            fake_node_id = -(len(self.relationships) + 1)
            
            relationship = {
                'container': manual_rel['container'],
                'cursor': manual_rel['cursor'],
                'type': manual_rel['type'],
                'node_id': fake_node_id
            }
            
            # Add metadata if provided
            if 'description' in manual_rel:
                relationship['description'] = manual_rel['description']
            
            # Avoid duplicates (check by container, cursor, type)
            existing = [r for r in self.relationships 
                       if r['container'] == relationship['container'] 
                       and r['cursor'] == relationship['cursor']
                       and r['type'] == relationship['type']]
            
            if not existing:
                self.relationships.append(relationship)
                print(f"Added manual relationship: {manual_rel['container']} -> {manual_rel['cursor']} ({manual_rel['type']})") 