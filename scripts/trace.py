import sys
import textwrap
import ast
import json
from collections import Counter

def normalize_indentation(code_str):
    """Normalize code indentation to use 4 spaces and remove unnecessary whitespace."""
    # Remove leading/trailing blank lines and common leading whitespace
    code_str = textwrap.dedent(code_str).strip()
    
    # Split into lines and remove trailing whitespace
    lines = [line.rstrip() for line in code_str.splitlines()]
    
    # Find first non-empty line's indentation to determine base level
    base_indent = 0
    for line in lines:
        if line.strip():
            base_indent = len(line) - len(line.lstrip())
            break
    
    # Adjust indentation to be relative to base_indent
    normalized_lines = []
    for line in lines:
        if line.strip():  # Non-empty line
            # Remove base indentation and replace with 4-space multiples
            stripped = line[base_indent:] if len(line) >= base_indent else line
            current_indent = len(line) - len(line.lstrip())
            relative_indent = max(0, current_indent - base_indent)
            spaces = relative_indent // 4 * 4  # Round to nearest 4 spaces
            normalized_lines.append(' ' * spaces + stripped.lstrip())
        else:  # Empty line
            normalized_lines.append('')
    
    return '\n'.join(normalized_lines)

def serialize_value(val):
    if isinstance(val, (int, float, bool, str)):
        return val
    elif isinstance(val, (list, tuple)):
        return [serialize_value(x) for x in val]
    elif isinstance(val, dict):
        return {str(k): serialize_value(v) for k, v in val.items()}
    elif val is None:
        return None
    return str(val)  # fallback for other types

# the locals are just a subset of this problem as a dictionary
# should just define the keys that have changed
# for dict: dict keys
# for lists: list indices
# for primitives: the value
# if no change, just don't have any entries
# always returns a list
# distinguish modified and added
def get_delta(prev, curr):
    print("prev", prev)
    print("curr", curr)
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
                changed_keys[k] = get_delta(None, curr[k])
            # changed variable
            else:
                maybe_delta = get_delta(prev[k], curr[k])
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
            maybe_delta = get_delta(prev[i], curr[i])
            if maybe_delta is not None:
                changed_keys[i] = maybe_delta
        # assign extra values
        if len(curr) > len(prev):
            for i in range(len(prev), len(curr)):
                changed_keys[i] = get_delta(None, curr[i])
        if changed_keys:
            delta = changed_keys
        # if there was nothing previously, assigning something still counts
        elif was_none:
            delta = []
    elif curr != prev:
        # Changed primitive value
        delta = curr
    return delta


def run_code_with_json_trace(code_str, func_name, json_output_path=None, **kwargs):
    # Clean up and normalize input code
    normalized_code = normalize_indentation(code_str)
    code_lines = normalized_code.splitlines()
    compiled_code = compile(normalized_code, "<user_code>", 'exec')
    local_ns = {}

    # Identify lines with conditionals (e.g., if, while)
    conditional_lines = {node.lineno for node in ast.walk(ast.parse(normalized_code)) if isinstance(node, (ast.If, ast.While))}

    # for node in ast.walk(ast.parse(normalized_code)):
    #     try:
    #         print(node.lineno)
    #     except:
    #         pass
    #     print(ast.dump(node))

    # Initialize the structured output
    output = {
        "metadata": {
            "code": normalized_code,
            "function": func_name,
            "inputs": {
                "kwargs": {k: repr(v) for k, v in kwargs.items()}
            }
        },
        "trace": [],
        "result": None
    }

    prev_locals = {}

    def trace_lines(frame, event, arg):
        nonlocal prev_locals

        if frame.f_globals.get("__name__") != "__main__":
            return

        if event == 'line':
            abs_lineno = frame.f_lineno
            rel_lineno = abs_lineno - compiled_code.co_firstlineno + 1

            # Only process if we're within the function's code
            if not (1 <= rel_lineno <= len(code_lines)):
                return

            curr_locals = {k: serialize_value(v) for k, v in frame.f_locals.items()}
            # Calculate delta: new or changed variables
            delta = get_delta(prev_locals, curr_locals)

            trace_entry = {
                "line_number": rel_lineno,
                "locals": curr_locals,
                "delta": delta
            }

            # Handle conditional evaluation
            if rel_lineno in conditional_lines:
                try:
                    code_line = code_lines[rel_lineno - 1]
                    if code_line.lstrip().startswith(('if ', 'while ')):
                        condition = code_line.split(':', 1)[0]
                        if condition.lstrip().startswith('if '):
                            condition = condition.split('if ', 1)[1]
                        else:
                            condition = condition.split('while ', 1)[1]
                        eval_result = eval(condition.strip(), frame.f_globals, frame.f_locals)
                        trace_entry["eval_result"] = eval_result
                except Exception as e:
                    trace_entry["eval_result"] = f"Error: {str(e).strip()}"

            output["trace"].append(trace_entry)
            prev_locals = curr_locals.copy()

        return trace_lines

    # Execute code to define function
    exec(compiled_code, {"__name__": "__main__"}, local_ns)

    # Trace execution
    sys.settrace(trace_lines)
    result = local_ns[func_name](**kwargs)
    sys.settrace(None)

    # Store the result
    output["result"] = result
    return output

# === Example usage ===
if __name__ == "__main__":
    code_input = """
    def twoSum(nums, target):
        num_to_index = {}  # maps number to its index
        for i, num in enumerate(nums):
            complement = target - num
            if complement in num_to_index:
                return [num_to_index[complement], i]
            num_to_index[num] = i
    """

    trace = run_code_with_json_trace(code_input, "twoSum", nums=[2, 11, 15, 7], target=9)
    with open("../public/trace.json", "w") as f:
        json.dump(trace, f, indent=2)