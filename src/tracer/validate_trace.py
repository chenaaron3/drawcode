#!/usr/bin/env python3
"""
Validation script to check that all AST nodes with the same ID have the same type.
Run this after generating trace files to ensure data integrity.

Usage:
    python3 validate_trace.py <trace_file.json>
    python3 validate_trace.py public/traces/  # Validate all files in directory
    
Or use validate_tree(ast_root) to validate an AST object directly.
"""

import json
import sys
import os
import glob
from pathlib import Path
import ast

def collect_ast_node_info(obj, node_info=None):
    """
    Recursively collect AST nodes with their IDs and types from JSON data
    
    Args:
        obj: JSON object to traverse (should be the AST section)
        node_info: Dict mapping node_id -> list of (type, context) tuples
        
    Returns:
        Dict mapping node_id -> list of (type, context) tuples
    """
    if node_info is None:
        node_info = {}
    
    # Validate JSON
    if isinstance(obj, dict):
        # Check if this is an AST node with node_id and type
        if 'node_id' in obj and 'type' in obj:
            node_id = obj['node_id']
            node_type = obj['type']
            
            if node_id not in node_info:
                node_info[node_id] = []
            node_info[node_id].append(node_type)
        
        # Recursively process all values
        for value in obj.values():
            collect_ast_node_info(value, node_info)
    elif isinstance(obj, list):
        # Recursively process all items
        for item in obj:
            collect_ast_node_info(item, node_info)
    # Validate AST
    elif isinstance(obj, ast.AST):
        node_id = getattr(obj, "_tracer_id", None)
        # get the name of the node
        node_type = type(obj).__name__
        # node_id is None for marker nodes
        if node_id is not None:
            if node_id not in node_info:
                node_info[node_id] = []
            node_info[node_id].append(node_type)
        # iterate through children to collect info
        for child in ast.iter_child_nodes(obj):
            collect_ast_node_info(child, node_info)
    return node_info


def validate_tree(ast_root):
    """
    Validate an AST tree object directly for node ID consistency
    
    Args:
        ast_root: The AST root object (from ast_transformer or converted to dict)
        
    Returns:
        Tuple of (is_valid, conflicts, total_ast_nodes)
    """
    # Collect AST node information from the AST root
    node_info = collect_ast_node_info(ast_root)
    
    # Check for conflicts
    conflicts = []
    for node_id, type_list in node_info.items():
        # Extract unique types for this node ID
        types = set(type_list)
        
        if len(types) > 1:
            conflicts.append({
                'node_id': node_id,
                'types': list(types),
            })
    
    return len(conflicts) == 0, conflicts, len(node_info)


def validate_trace_file(filepath):
    """
    Validate a single trace file for AST node ID consistency
    
    Args:
        filepath: Path to the trace JSON file
        
    Returns:
        Tuple of (is_valid, conflicts, total_ast_nodes)
    """
    try:
        with open(filepath, 'r') as f:
            trace_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"❌ Error reading {filepath}: {e}")
        return False, [], 0
    
    # Check if AST section exists
    if 'ast' not in trace_data:
        print(f"❌ No 'ast' section found in {filepath}")
        return False, [], 0
    
    # Use the validate_tree function on the AST section
    return validate_tree(trace_data['ast'])


def format_conflict_report(conflicts, filepath=None):
    """Format a detailed conflict report"""
    if filepath:
        print(f"\n🚨 VALIDATION FAILED: {filepath}")
    else:
        print(f"\n🚨 VALIDATION FAILED")
    print(f"Found {len(conflicts)} AST node ID conflicts:")
    
    for conflict in conflicts:
        node_id = conflict['node_id']
        types = conflict['types']
        
        print(f"\n  Node ID {node_id} has {len(types)} different AST types:")
        for node_type in types:
            print(f"    • {node_type}")
            if len(types) > 3:
                print(f"      ... and {len(types) - 3} more")


def validate_single_file(filepath):
    """Validate a single trace file"""
    print(f"🔍 Validating: {filepath}")
    
    is_valid, conflicts, total_nodes = validate_trace_file(filepath)
    
    if is_valid:
        print(f"✅ VALID - {total_nodes} unique AST node IDs, no conflicts")
        return True
    else:
        format_conflict_report(conflicts, filepath)
        return False


def validate_directory(directory):
    """Validate all JSON files in a directory"""
    json_files = glob.glob(os.path.join(directory, "*.json"))
    
    if not json_files:
        print(f"❌ No JSON files found in {directory}")
        return False
    
    print(f"🔍 Found {len(json_files)} JSON files in {directory}")
    
    all_valid = True
    valid_count = 0
    
    for filepath in sorted(json_files):
        filename = os.path.basename(filepath)
        print(f"\n{'='*50}")
        print(f"Validating: {filename}")
        print('='*50)
        
        if validate_single_file(filepath):
            valid_count += 1
        else:
            all_valid = False
    
    # Summary
    print(f"\n{'='*50}")
    print("VALIDATION SUMMARY")
    print('='*50)
    print(f"Total files: {len(json_files)}")
    print(f"Valid files: {valid_count}")
    print(f"Invalid files: {len(json_files) - valid_count}")
    
    if all_valid:
        print("🎉 ALL FILES PASSED VALIDATION!")
    else:
        print("❌ SOME FILES FAILED VALIDATION")
    
    return all_valid


def main():
    """Main validation function"""
    if len(sys.argv) != 2:
        print("Usage:")
        print("  python3 validate_trace.py <trace_file.json>")
        print("  python3 validate_trace.py <directory>")
        sys.exit(1)
    
    path = sys.argv[1]
    
    if not os.path.exists(path):
        print(f"❌ Path does not exist: {path}")
        sys.exit(1)
    
    print("🔍 AST Node ID Validation Tool")
    print("Checking that all AST nodes with the same ID have the same type...")
    print("(Only examining the 'ast' section of trace files)\n")
    
    if os.path.isfile(path):
        # Validate single file
        success = validate_single_file(path)
    elif os.path.isdir(path):
        # Validate directory
        success = validate_directory(path)
    else:
        print(f"❌ Invalid path: {path}")
        sys.exit(1)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main() 