import argparse
import sys
import os
import re
import json
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI

USE_LLM_CACHE = False

# Example file paths (update if needed)
PROMPT_TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'lesson_generation_prompt.txt')
EXAMPLE_JSON_PATH = os.path.join(os.path.dirname(__file__), '../src/data/lesson-problems.json')
EXAMPLE_MD_PATH = os.path.join(os.path.dirname(__file__), '../src/lessons/hooks/hello-world/hello-world.md')
EXAMPLE_HOOK_PATH = os.path.join(os.path.dirname(__file__), '../src/lessons/hooks/hello-world/useHelloWorld.ts')

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

def load_few_shot_examples():
    # Load the first lesson-problems.json entry
    if not os.path.exists(EXAMPLE_JSON_PATH):
        raise FileNotFoundError(f"Example JSON file not found: {EXAMPLE_JSON_PATH}")
    with open(EXAMPLE_JSON_PATH, 'r', encoding='utf-8') as f:
        json_data = f.read()
    try:
        json_list = json.loads(json_data)
        example_json = json.dumps(json_list[0], indent=2)
    except Exception as e:
        raise ValueError(f"Failed to parse example JSON: {e}")

    # Load markdown
    if not os.path.exists(EXAMPLE_MD_PATH):
        raise FileNotFoundError(f"Example markdown file not found: {EXAMPLE_MD_PATH}")
    with open(EXAMPLE_MD_PATH, 'r', encoding='utf-8') as f:
        example_md = f.read()

    # Load hook
    if not os.path.exists(EXAMPLE_HOOK_PATH):
        raise FileNotFoundError(f"Example hook file not found: {EXAMPLE_HOOK_PATH}")
    with open(EXAMPLE_HOOK_PATH, 'r', encoding='utf-8') as f:
        example_hook = f.read()

    return example_json, example_md, example_hook

def load_prompt_template():
    if not os.path.exists(PROMPT_TEMPLATE_PATH):
        raise FileNotFoundError(f"Prompt template file not found: {PROMPT_TEMPLATE_PATH}")
    with open(PROMPT_TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        return f.read()

def build_llm_prompt(source_text, module_id):
    prompt_template = load_prompt_template()
    example_json, example_md, example_hook = load_few_shot_examples()
    examples = (
        '## Example lesson-problems.json\n```json\n' + example_json + '\n```\n\n'
        '## Example lesson.md\n```markdown\n' + example_md + '\n```\n\n'
        '## Example lesson-hook.ts\n```typescript\n' + example_hook + '\n```\n'
    )
    prompt = prompt_template.replace('{EXAMPLES}', examples)
    prompt = prompt.replace('{INPUT}', source_text)
    prompt = prompt.replace('{MODULE_ID}', module_id)
    return prompt

def generate_lesson_content(client, source_text, module_id):
    prompt = build_llm_prompt(source_text, module_id)
    # Define the function schema for OpenAI function calling
    functions = [
        {
            "name": "generate_lesson",
            "description": "Generate a lesson in three parts: lesson_json, lesson_markdown, lesson_typescript.",
            "parameters": {
                "type": "object",
                "properties": {
                    "lesson_json": {"type": "string"},
                    "lesson_markdown": {"type": "string"},
                    "lesson_typescript": {"type": "string"}
                },
                "required": ["lesson_json", "lesson_markdown", "lesson_typescript"]
            }
        }
    ]
    try:
        # Use a cheaper model for testing (e.g., gpt-3.5-turbo-1106)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
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
            "json": data["lesson_json"].strip(),
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

def update_lessons_json(lesson_json_str, lessons_file_path):
    if not os.path.exists(lessons_file_path):
        raise FileNotFoundError(f"lesson-problems.json not found: {lessons_file_path}")
    with open(lessons_file_path, 'r', encoding='utf-8') as f:
        lessons = json.load(f)
    lesson_obj = json.loads(lesson_json_str)
    lessons.append(lesson_obj)
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
        else:
            print("Generating lesson content with GPT-3.5-turbo-1106 (function calling)...")
            generated_content = generate_lesson_content(client, source_text, args.module_id)
            json.dump(generated_content, open("generated_content.json", "w"), indent=2)

        # Step 4: Parse LLM output
        # If using function calling, generated_content is a JSON string, so parse it first
        if isinstance(generated_content, str):
            generated_content = json.loads(generated_content)
        parsed_content = parse_generated_content(generated_content)
        print("Successfully parsed LLM output.")

        # Step 5: Extract lesson_id from the JSON artifact
        lesson_json_obj = json.loads(parsed_content["json"])
        lesson_id = lesson_json_obj["id"]
        lesson_id = ensure_unique_lesson_id(lesson_id, lessons_json_path)
        print(f"Using lesson ID from LLM: {lesson_id}")

        # Step 6: Update lesson-problems.json
        update_lessons_json(parsed_content["json"], lessons_json_path)
        print(f"Updated lesson-problems.json with new entry for '{lesson_id}'.")

        # Step 7: Create lesson files and get paths
        paths = create_lesson_files(lesson_id, args.module_id, parsed_content["markdown"], parsed_content["typescript"])
        print(f"Created/overwritten lesson files for '{lesson_id}' in module '{args.module_id}'.")

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