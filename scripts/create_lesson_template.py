import os
import sys
import json

def to_pascal_case(s):
    return ''.join(word.capitalize() for word in s.replace('-', ' ').replace('_', ' ').split())

def main():
    if len(sys.argv) != 3:
        print("Usage: python scripts/create_lesson_template.py <lessonId> <moduleId>")
        sys.exit(1)

    lesson_id = sys.argv[1]
    module_id = sys.argv[2]

    # Get project root (parent of 'scripts' directory)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # 1. Update module's lesson list in lesson-modules.json
    modules_json_path = os.path.join(project_root, 'src', 'data', 'lesson-modules.json')
    if not os.path.exists(modules_json_path):
        print(f"Modules file not found: {modules_json_path}")
        sys.exit(1)

    with open(modules_json_path, 'r', encoding='utf-8') as f:
        modules_data = json.load(f)

    module_found = False
    for module in modules_data.get('modules', []):
        if module.get('id') == module_id:
            module_found = True
            if 'lessonIds' not in module:
                module['lessonIds'] = []
            if lesson_id not in module['lessonIds']:
                module['lessonIds'].append(lesson_id)
                print(f"Added {lesson_id} to module {module_id}")
            else:
                print(f"{lesson_id} already in module {module_id}")

    if not module_found:
        print(f"Module id '{module_id}' not found in {modules_json_path}")
        sys.exit(1)

    with open(modules_json_path, 'w', encoding='utf-8') as f:
        json.dump(modules_data, f, indent=2)

    # 2. Create lesson folder
    lesson_folder = os.path.join(project_root, 'src', 'lessons', 'hooks', lesson_id)
    os.makedirs(lesson_folder, exist_ok=True)

    # 3. Create markdown file
    md_path = os.path.join(lesson_folder, f"{lesson_id}.md")
    if not os.path.exists(md_path):
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(f"# {to_pascal_case(lesson_id)}\n\nLesson content here.\n")
        print(f"Created {md_path}")
    else:
        print(f"{md_path} already exists")

    # 4. Create hook file
    hook_name = f"use{to_pascal_case(lesson_id)}"
    hook_path = os.path.join(lesson_folder, f"{hook_name}.ts")
    if not os.path.exists(hook_path):
        with open(hook_path, 'w', encoding='utf-8') as f:
            f.write(
f"""import {{ useLessonStore }} from '@/store/lessonStore';
import {{ useTraceStore }} from '@/store/traceStore';
import content from "./{lesson_id}.md?raw";
import {{ useEffect }} from "react";

export function {hook_name}(lessonId: string) {{
  // Add lesson-specific logic here
  const {{ startLesson, completeTask, currentTask }} = useLessonStore();
  const {{ traceData }} = useTraceStore();

useEffect(() => {{
    if (lessonId !== "{lesson_id}") return;
    // Start the lesson
    startLesson(lessonId, content, [
    ]);
  }}, [lessonId, startLesson]);
}}
""")
        print(f"Created {hook_path}")
    else:
        print(f"{hook_path} already exists")

    # 5. Optionally run trace.py with the new lesson_id
    trace_py_path = os.path.join(project_root, 'src', 'tracer', 'trace.py')
    if os.path.exists(trace_py_path):
        import subprocess
        print(f"Running trace.py")
        try:
            result = subprocess.run([
                sys.executable, trace_py_path
            ], capture_output=True, text=True, check=True)
            print(result.stdout)
            if result.stderr:
                print(result.stderr)
        except subprocess.CalledProcessError as e:
            print(f"trace.py failed: {e}")
            print(e.output)
    else:
        print(f"trace.py not found at {trace_py_path}, skipping trace generation.")

if __name__ == '__main__':
    main() 