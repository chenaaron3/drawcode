import argparse
import sys
import os
import re
import json
from dotenv import load_dotenv
import jsonschema
load_dotenv()
from openai import OpenAI

USE_LLM_CACHE = False
MODEL = "gpt-4o"

# Example file paths (update if needed)
PROMPT_TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'lesson_generation_verbaitm_prompt.txt')
HOOKS_PATH = os.path.join(os.path.dirname(__file__), '../src/lessons/hooks')
EXAMPLE_INPUT_PATH = os.path.join(os.path.dirname(__file__), 'examples')
EXAMPLE_JSON_PATH = os.path.join(os.path.dirname(__file__), '../src/data/lesson-problems.json')
EXAMPLES = {
    'changing-numbers': {
        'input': os.path.join(EXAMPLE_INPUT_PATH, 'changing-numbers.txt'),
        'md': os.path.join(HOOKS_PATH, 'changing-numbers', 'changing-numbers.md'),
        'hook': os.path.join(HOOKS_PATH, 'changing-numbers', 'useChangingNumbers.ts'),
    },
    'plus-equals': {
        'input': os.path.join(EXAMPLE_INPUT_PATH, 'plus-equals.txt'),
        'md': os.path.join(HOOKS_PATH, 'plus-equals', 'plus-equals.md'),
        'hook': os.path.join(HOOKS_PATH, 'plus-equals', 'usePlusEquals.ts'),
    }
}

LESSON_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "title": {"type": "string"},
        "description": {"type": "string"},
        "template": {"type": "string"},
        "solution": {"type": "string"},
        "entrypoint": {"type": "string"},
        "inputs": {"type": "object"},
        "time": {"type": "integer"},
        "mode": {"type": "string"}
    },
    "required": [
        "id", "title", "description", "template", "solution",
        "entrypoint", "time", "mode"
    ],
    "additionalProperties": False
}

def parse_arguments():
    parser = argparse.ArgumentParser(
        description='Generate a PythonQuest lesson from external content using GPT-4.'
    )
    parser.add_argument('file_path', help='Path to the source lesson text file')
    parser.add_argument('module_id', help='ID of the module this lesson belongs to')
    parser.add_argument('--lesson_id', help='Optional custom lesson ID (will auto-increment if exists)')
    return parser.parse_args()

def initialize_openai_client():
    # With openai>=1.0.0, just instantiate OpenAI() and it will use the env var
    try:
        client = OpenAI()
        return client
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}", file=sys.stderr)
        sys.exit(1)

def load_few_shot_example(lesson_id, i):
    if not os.path.exists(EXAMPLE_JSON_PATH):
        raise FileNotFoundError(f"Example JSON file not found: {EXAMPLE_JSON_PATH}")
    with open(EXAMPLE_JSON_PATH, 'r', encoding='utf-8') as f:
        json_data = f.read()
    try:
        json_list = json.loads(json_data)
        lesson = next((l for l in json_list if l["id"] == lesson_id), None)
        example_json = json.dumps(lesson, indent=2)
    except Exception as e:
        raise e
    
    # Load markdown
    EXAMPLE_MD_PATH = EXAMPLES[lesson_id]['md']
    if not os.path.exists(EXAMPLE_MD_PATH):
        raise FileNotFoundError(f"Example markdown file not found: {EXAMPLE_MD_PATH}")
    with open(EXAMPLE_MD_PATH, 'r', encoding='utf-8') as f:
        example_md = f.read()

    # Load hook
    EXAMPLE_HOOK_PATH = EXAMPLES[lesson_id]['hook']
    if not os.path.exists(EXAMPLE_HOOK_PATH):
        raise FileNotFoundError(f"Example hook file not found: {EXAMPLE_HOOK_PATH}")
    with open(EXAMPLE_HOOK_PATH, 'r', encoding='utf-8') as f:
        example_hook = f.read()

        # Load input
    EXAMPLE_INPUT_PATH = EXAMPLES[lesson_id]['input']
    if not os.path.exists(EXAMPLE_INPUT_PATH):
        raise FileNotFoundError(f"Example input file not found: {EXAMPLE_INPUT_PATH}")
    with open(EXAMPLE_INPUT_PATH, 'r', encoding='utf-8') as f:
        example_input = f.read()

    example_output = {
        "lesson_json": example_json,
        "lesson_markdown": example_md,
        "lesson_typescript": example_hook
    }
    example_text = f"""
# Example {i} Input:
{example_input}

# Example {i} Output:
{example_output}
"""
    return example_text


def load_few_shot_examples():
    examples = ""
    for i, key in enumerate(EXAMPLES):
        example_output = load_few_shot_example(key, i)
        examples += example_output + "\n\n"
    return examples
    
def load_prompt_template():
    if not os.path.exists(PROMPT_TEMPLATE_PATH):
        raise FileNotFoundError(f"Prompt template file not found: {PROMPT_TEMPLATE_PATH}")
    with open(PROMPT_TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        return f.read()

def build_llm_prompt(source_text, module_id, lesson_id=None):
    prompt_template = load_prompt_template()
    examples = load_few_shot_examples()

    prompt = prompt_template.replace('{EXAMPLES}', examples)
    prompt = prompt.replace('{INPUT}', source_text)
    prompt = prompt.replace('{MODULE_ID}', module_id)
    if lesson_id:
        prompt = prompt.replace('{LESSON_ID}', lesson_id)
    else:
        prompt = prompt.replace('{LESSON_ID}', '')
    return prompt

def generate_lesson_content(client, source_text, module_id, lesson_id=None):
    prompt = build_llm_prompt(source_text, module_id, lesson_id)
    # Define the function schema for OpenAI function calling
    functions = [
        {
            "name": "generate_lesson",
            "description": "Generate a lesson in three parts: lesson_json, lesson_markdown, lesson_typescript.",
            "parameters": {
                "type": "object",
                "properties": {
                    "lesson_json": {
                        "type": "object",
                        "description": "Lesson data object. All fields required. No additional properties allowed.",
                        "properties": {
                            "id": {"type": "string"},
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "template": {"type": "string"},
                            "solution": {"type": "string"},
                            "entrypoint": {"type": "string"},
                            "inputs": {"type": "object"},
                            "time": {"type": "integer"},
                            "mode": {"type": "string"}
                        },
                        "required": [
                            "id", "title", "description", "template", "solution",
                            "entrypoint", "inputs", "time", "mode"
                        ],
                        "additionalProperties": False
                    },
                    "lesson_markdown": {"type": "string"},
                    "lesson_typescript": {"type": "string"}
                },
                "required": ["lesson_json", "lesson_markdown", "lesson_typescript"]
            }
        }
    ]
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            functions=functions,
            function_call={"name": "generate_lesson"},
            temperature=0.7,
            max_tokens=4000
        )
        # Parse the function_call.arguments JSON for the result
        arguments = response.choices[0].message.function_call.arguments
        return arguments
    except Exception as e:
        print(f"Error during OpenAI API call: {e}", file=sys.stderr)
        sys.exit(1)

def parse_generated_content(content):
    """
    Accepts a dict (already parsed JSON) with fields:
    'lesson_json', 'lesson_markdown', 'lesson_typescript'.
    Raises ValueError if any field is missing.
    """
    try:
        data = content
        required_fields = ["lesson_json", "lesson_markdown", "lesson_typescript"]
        if not all(field in data for field in required_fields):
            missing = [f for f in required_fields if f not in data]
            raise ValueError(f"Missing fields in LLM output: {', '.join(missing)}")
        return {
            "json": data["lesson_json"],
            "markdown": data["lesson_markdown"].strip(),
            "typescript": data["lesson_typescript"].strip()
        }
    except Exception as e:
        raise ValueError(f"Failed to parse structured LLM output: {e}")

def ensure_unique_lesson_id(lesson_id, lessons_file_path):
    if not os.path.exists(lessons_file_path):
        raise FileNotFoundError(f"lesson-problems.json not found: {lessons_file_path}")
    with open(lessons_file_path, 'r', encoding='utf-8') as f:
        lessons = json.load(f)
    existing_ids = {lesson["id"] for lesson in lessons}
    if lesson_id not in existing_ids:
        return lesson_id
    base_id = lesson_id
    counter = 2
    while f"{base_id}-{counter}" in existing_ids:
        counter += 1
    return f"{base_id}-{counter}"

def update_lessons_json(lesson_json_obj, lessons_file_path):
    if not os.path.exists(lessons_file_path):
        raise FileNotFoundError(f"lesson-problems.json not found: {lessons_file_path}")
    with open(lessons_file_path, 'r', encoding='utf-8') as f:
        lessons = json.load(f)
    lessons.append(lesson_json_obj)
    with open(lessons_file_path, 'w', encoding='utf-8') as f:
        json.dump(lessons, f, indent=2)

def create_lesson_files(lesson_id, module_id, markdown_content, typescript_content):
    try:
        from create_lesson_template import create_lesson_template
    except ImportError as e:
        print(f"Error importing create_lesson_template: {e}", file=sys.stderr)
        raise
    # Run the template creation logic and get paths
    paths = create_lesson_template(lesson_id, module_id)
    md_path = paths['md_path']
    hook_path = paths['hook_path']
    # Overwrite files
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    with open(hook_path, 'w', encoding='utf-8') as f:
        f.write(typescript_content)
    return paths

def escape_newlines_in_json(json_str):
    # This is a simple approach and assumes no multiline string values with embedded quotes
    # For robust handling, use a JSON parser that supports non-standard JSON, or fix at the source
    return re.sub(r'(?<!\\)\n', r'\\n', json_str)

def update_lesson_hooks_index(lesson_id, hook_path):
    """
    Adds an import and entry to lessonHooks in src/lessons/index.ts for the new lesson.
    Uses the actual hook_path returned from create_lesson_files.
    """
    import os
    # Get the index.ts path
    index_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/lessons/index.ts'))

    # Compute the import path relative to index.ts (without .ts extension)
    import_path = os.path.relpath(hook_path, os.path.dirname(index_path)).replace('.ts', '').replace('\\', '/')
    if not import_path.startswith('.'):
        import_path = './' + import_path

    # Derive hook name from filename
    hook_name = os.path.splitext(os.path.basename(hook_path))[0]

    with open(index_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Check if already present
    import_line = f'import {{ {hook_name} }} from "{import_path}";\n'
    if any(import_line.strip() == line.strip() for line in lines):
        return  # Already present

    # Insert import after last import
    last_import_idx = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import_idx = i
    lines.insert(last_import_idx + 1, import_line)

    # Add to lessonHooks
    for i, line in enumerate(lines):
        if 'export const lessonHooks:' in line:
            # Find the next '{'
            for j in range(i, len(lines)):
                if '{' in lines[j]:
                    insert_idx = j + 1
                    break
            else:
                continue
            # Insert new entry
            entry_line = f'  "{lesson_id}": {hook_name},\n'
            # Find where to insert (before closing })
            for k in range(insert_idx, len(lines)):
                if '};' in lines[k]:
                    lines.insert(k, entry_line)
                    break
            break

    with open(index_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

def main():
    args = parse_arguments()
    lessons_json_path = os.path.join(os.path.dirname(__file__), '../src/data/lesson-problems.json')
    try:
        # Step 1: Read source lesson text
        with open(args.file_path, 'r', encoding='utf-8') as f:
            source_text = f.read()

        # Step 2: Initialize OpenAI client
        client = initialize_openai_client()

        # Step 3: Generate lesson content with LLM
        if USE_LLM_CACHE:
            print("Loading generated lesson content from file for testing...")
            with open("generated_content.json", "r", encoding="utf-8") as f:
                generated_content = json.load(f)
            prompt = build_llm_prompt(source_text, args.module_id, args.lesson_id)
            print(prompt)
        else:
            print(f"Generating lesson content with {MODEL} (function calling)...")
            # pass in the lesson_id if specified
            generated_content = generate_lesson_content(client, source_text, args.module_id, args.lesson_id)
            json.dump(generated_content, open("generated_content.json", "w"), indent=2)

        # Step 4: Parse LLM output
        # If using function calling, generated_content is a JSON string, so parse it first
        if isinstance(generated_content, str):
            generated_content = json.loads(generated_content)
        parsed_content = parse_generated_content(generated_content)
        print("Successfully parsed LLM output.")

        # Step 5: Extract lesson_id from the JSON artifact
        lesson_json_obj = parsed_content["json"]
        # Validate lesson_json_obj against schema
        try:
            jsonschema.validate(instance=lesson_json_obj, schema=LESSON_JSON_SCHEMA)
        except jsonschema.ValidationError as ve:
            print(f"❌ lesson_json validation error: {ve.message}", file=sys.stderr)
            sys.exit(1)
        lesson_id = lesson_json_obj["id"]
        lesson_id = ensure_unique_lesson_id(lesson_id, lessons_json_path)
        print(f"Using lesson ID from LLM: {lesson_id}")

        # Step 6: Update lesson-problems.json
        update_lessons_json(lesson_json_obj, lessons_json_path)
        print(f"Updated lesson-problems.json with new entry for '{lesson_id}'.")

        # Step 7: Create lesson files and get paths
        paths = create_lesson_files(lesson_id, args.module_id, parsed_content["markdown"], parsed_content["typescript"])
        print(f"Created/overwritten lesson files for '{lesson_id}' in module '{args.module_id}'.")

        # Step 7.5: Update src/lessons/index.ts to import and register the new hook
        update_lesson_hooks_index(lesson_id, paths["hook_path"])
        print(f"Updated src/lessons/index.ts to register hook for '{lesson_id}'.")

        # Step 8: Print summary with actual paths
        print("\n✅ Lesson generation complete!")
        print(f"- Lesson ID: {lesson_id}")
        print(f"- Module ID: {args.module_id}")
        print(f"- Markdown file: {paths['md_path']}")
        print(f"- Hook file: {paths['hook_path']}")
        print(f"- lesson-problems.json updated.")
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main() 