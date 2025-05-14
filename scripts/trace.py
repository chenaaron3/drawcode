import sys
import textwrap
import ast
import json

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

def run_code_with_json_trace(code_str, func_name, json_output_path=None, **kwargs):
    # Clean up and normalize input code
    normalized_code = normalize_indentation(code_str)
    code_lines = normalized_code.splitlines()
    compiled_code = compile(normalized_code, "<user_code>", 'exec')
    local_ns = {}

    # Identify lines with conditionals (e.g., if, while)
    conditional_lines = {node.lineno for node in ast.walk(ast.parse(normalized_code)) if isinstance(node, (ast.If, ast.While))}

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

            curr_locals = {k: repr(v).strip() for k, v in frame.f_locals.items()}
            
            # Calculate delta: new or changed variables
            delta = {
                k: v for k, v in curr_locals.items()
                if k not in prev_locals or prev_locals[k] != v
            }

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

    # Save JSON file if desired
    if json_output_path:
        with open(json_output_path, "w") as f:
            json.dump(output, f, indent=2)

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