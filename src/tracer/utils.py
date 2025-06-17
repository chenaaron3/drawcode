import copy

"""
Utility functions for the Python tracer that don't depend on class state.
These are pure functions that can be used across different modules.
"""

# Helper to detect mutability for pointer-aware tracing

def is_mutable(obj):
    """Return True if the object is mutable (list, dict, set, or custom class), False otherwise."""
    return isinstance(obj, (list, dict, set)) or hasattr(obj, "__dict__")

def format_object_nicely(val):
    """Format Python objects in a user-friendly way"""
    val_str = str(val)

    # Handle built-in classes (e.g., "<class 'enumerate'>" -> "enumerate")
    if val_str.startswith("<class '") and val_str.endswith("'>"):
        class_name = val_str[8:-2]  # Extract class name
        if '.' in class_name:
            return class_name.split('.')[-1]  # Get just the class name, not module
        return class_name
    
    # Handle built-in functions (e.g., "<built-in function len>" -> "len()")
    if val_str.startswith("<built-in function ") and val_str.endswith(">"):
        func_name = val_str[19:-1]  # Extract function name
        return f"{func_name}()"
    
    # Handle built-in methods (e.g., "<built-in method append of list object at 0x...>" -> "list.append()")
    if val_str.startswith("<built-in method ") and " of " in val_str:
        parts = val_str[17:].split(" of ")
        method_name = parts[0]
        container_type = parts[1].split(" object")[0]
        return f"{container_type}.{method_name}()"
    
    # Handle bound methods (e.g., "<bound method MinStack.push of <__main__.MinStack object at 0x...>>" -> "MinStack.push()")
    if val_str.startswith("<bound method ") and " of " in val_str:
        parts = val_str[14:].split(" of ")
        method_name = parts[0]
        return f"{method_name}()"
    
    # Handle function objects (e.g., "<function hasCycle.<locals>.create_linked_list at 0x...>" -> "create_linked_list()")
    if val_str.startswith("<function ") and " at " in val_str:
        func_part = val_str[10:].split(" at ")[0]
        if ".<locals>." in func_part:
            func_name = func_part.split(".<locals>.")[-1]
        else:
            func_name = func_part.split(".")[-1]
        return f"{func_name}()"
    
    # Handle enumerate objects - expand them since they're usually small
    if val_str.startswith("<enumerate object"):
        try:
            # Convert enumerate to list of tuples
            enum_list = list(copy.deepcopy(val))
            return enum_list
        except:
            return "enumerate(...)"
    
    # Handle range objects - show the range parameters
    if val_str.startswith("range("):
        try:
            # Convert range to list
            range_list = list(copy.deepcopy(val))
            return range_list
        except:
            return "range(...)"
    
    # Handle custom class instances - show class name with a friendly identifier
    if val_str.startswith("<__main__.") and " object at " in val_str:
        class_name = val_str[10:].split(" object at")[0]
        # Extract memory address for unique identification
        memory_addr = val_str.split(" at ")[1][:-1]  # Remove the closing >
        # Use last 4 characters of memory address as a short identifier
        short_id = memory_addr[-4:]
        return f"{class_name}#{short_id}"
    
    # Handle other custom class instances
    if " object at " in val_str and val_str.startswith("<") and val_str.endswith(">"):
        parts = val_str[1:-1].split(" object at ")
        if len(parts) == 2:
            class_path = parts[0]
            memory_addr = parts[1]
            class_name = class_path.split(".")[-1]  # Get just the class name
            short_id = memory_addr[-4:]  # Last 4 chars of memory address
            return f"{class_name}#{short_id}"
    
    # Fallback to original string representation for anything else
    return val_str


def serialize_value(val):
    """Convert value to a JSON-serializable representation with user-friendly formatting"""
    if isinstance(val, (int, bool, str)):
        return val
    elif isinstance(val, float):
        # Handle special float values that are not valid JSON
        import math
        if math.isinf(val):
            return "Infinity" if val > 0 else "-Infinity"
        elif math.isnan(val):
            return "NaN"
        else:
            return val
    elif isinstance(val, (list, tuple, set)):
        return [serialize_value(x) for x in val]
    elif isinstance(val, dict):
        return {serialize_value(k): serialize_value(v) for k, v in val.items()}
    elif val is None:
        return None
    else:
        # return str(val)
        # Enhanced formatting for common Python objects
        return format_object_nicely(val)


def calculate_delta(prev, curr):
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
                changed_keys[k] = calculate_delta(None, curr[k])
            # changed variable
            else:
                maybe_delta = calculate_delta(prev[k], curr[k])
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
            maybe_delta = calculate_delta(prev[i], curr[i])
            if maybe_delta is not None:
                changed_keys[i] = maybe_delta
        # assign extra values
        if len(curr) > len(prev):
            for i in range(len(prev), len(curr)):
                changed_keys[i] = calculate_delta(None, curr[i])
        if changed_keys:
            delta = changed_keys
        # if there was nothing previously, assigning something still counts
        elif was_none:
            delta = []
    elif curr != prev:
        # Changed primitive value
        delta = curr
    return delta 

class TreeNode:
    """Definition for a binary tree node."""
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    
    def __repr__(self):
        return f"TreeNode({self.val})"


class Node:
    """Definition for a Node (graph node)."""
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
    
    def __repr__(self):
        neighbor_vals = [n.val for n in self.neighbors] if self.neighbors else []
        return f"Node({self.val}, neighbors={neighbor_vals})"


class ListNode:
    """Definition for singly-linked list."""
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    
    def __repr__(self):
        return f"ListNode({self.val})"


def list_to_binary_tree(arr):
    """Convert a list in level-order format to a binary tree.
    
    Args:
        arr: List representation of binary tree in level-order traversal.
             None or null values represent missing nodes.
    
    Returns:
        TreeNode: Root of the constructed binary tree, or None if empty.
    """
    if not arr or arr[0] is None:
        return None
    
    # Create root node
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    
    while queue and i < len(arr):
        node = queue.pop(0)
        
        # Add left child
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        
        # Add right child
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    
    return root


def adjlist_to_graph(adjList):
    """Convert an adjacency list to a graph of Node objects.
    
    Args:
        adjList: List of lists representing adjacency relationships.
                Each index i contains a list of neighbors for node i+1.
                Example: [[2,4],[1,3],[2,4],[1,3]] means:
                - Node 1 neighbors: [2, 4]
                - Node 2 neighbors: [1, 3]
                - Node 3 neighbors: [2, 4]
                - Node 4 neighbors: [1, 3]
    
    Returns:
        Node: The first node of the constructed graph, or None if empty.
    """
    if not adjList:
        return None
    
    # Create all nodes first (1-indexed)
    nodes = {}
    for i in range(len(adjList)):
        node_val = i + 1  # Nodes are 1-indexed
        nodes[node_val] = Node(node_val)
    
    # Set up neighbor relationships
    for i, neighbors in enumerate(adjList):
        node_val = i + 1
        current_node = nodes[node_val]
        
        # Add neighbor references
        for neighbor_val in neighbors:
            if neighbor_val in nodes:
                current_node.neighbors.append(nodes[neighbor_val])
    
    # Return the first node (node 1)
    return nodes.get(1, None)


def list_to_linked_list(arr):
    """Convert a list to a linked list.
    
    Args:
        arr: List of values to convert to linked list nodes.
             Example: [1, 2, 3, 4] becomes ListNode(1) -> ListNode(2) -> ListNode(3) -> ListNode(4)
    
    Returns:
        ListNode: Head of the constructed linked list, or None if empty.
    """
    if not arr:
        return None
    
    # Create head node
    head = ListNode(arr[0])
    current = head
    
    # Create remaining nodes
    for i in range(1, len(arr)):
        current.next = ListNode(arr[i])
        current = current.next
    
    return head