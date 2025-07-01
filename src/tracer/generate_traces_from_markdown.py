import os
import re
import sys
import json
import shutil
from pathlib import Path

# Import PythonTracer from the project
from python_tracer import PythonTracer

# Regex to match code blocks with python trace-id=...
CODE_BLOCK_REGEX = re.compile(
    r"```python[^\n`]*trace-id=([\w-]+)[^\n`]*\n([\s\S]*?)```",
    re.MULTILINE
)

# Directory to scan for markdown files
BLOG_DIR = Path(__file__).parent.parent / "data" / "blog"
TRACES_DIR = Path(__file__).parent.parent / "data" / "blog_traces"
shutil.rmtree(TRACES_DIR, ignore_errors=True)
TRACES_DIR.mkdir(exist_ok=True)

def find_markdown_files(root_dir):
    """Recursively find all .md and .markdown files under root_dir"""
    for dirpath, _, filenames in os.walk(root_dir):
        for fname in filenames:
            if fname.endswith(('.md', '.markdown')):
                yield os.path.join(dirpath, fname)

def extract_code_blocks(filepath):
    """Yield (trace_id, code, blog_slug, filepath) for each python trace-id code block in the file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    blog_slug = Path(filepath).stem
    for match in CODE_BLOCK_REGEX.finditer(content):
        trace_id = match.group(1)
        code = match.group(2)
        yield (trace_id, code, blog_slug, filepath)

def write_blog_traces_ts(trace_keys):
    output_path = TRACES_DIR / "index.ts"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('/* eslint-disable @typescript-eslint/no-require-imports */')
        f.write('// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n')
        f.write('export const BLOG_TRACES = {\n')
        for trace_name in sorted(trace_keys):
            f.write(f'  "{trace_name}": require("@/data/blog_traces/{trace_name}.json"),\n')
        f.write('};\n')
    print(f"Wrote static trace mapping to {output_path}")

def main():
    seen_trace_ids = {}
    count = 0
    tracer = PythonTracer()
    for md_file in find_markdown_files(BLOG_DIR):
        for trace_id, code, blog_slug, filepath in extract_code_blocks(md_file):
            tracer.reset()  # Reset tracer state for each problem
            trace_name = trace_id
            if trace_name in seen_trace_ids:
                raise ValueError(f"Duplicate trace name '{trace_name}' found in both {seen_trace_ids[trace_name]} and {filepath}")
            seen_trace_ids[trace_name] = filepath
            print(f"Generating trace for {trace_name} from {filepath}...")
            tree = tracer.run_code(code, entrypoint=None, special_inputs=None, problem_key=0)
            trace_data = tracer.get_trace_data(tree)
            out_path = TRACES_DIR / f"{trace_name}.json"
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(trace_data, f, indent=2)
            count += 1
    print(f"\nGenerated {count} trace(s) in {TRACES_DIR}/")
    write_blog_traces_ts(seen_trace_ids.keys())

if __name__ == "__main__":
    main() 