import sys
import json
import ast
import builtins
import os

# Import the refactored classes
from python_tracer import PythonTracer
from validate_trace import validate_directory

if __name__ == '__main__':
    PROBLEM_DIR = os.path.abspath(os.path.join(__file__, "..", "..", "data"))
    OUTPUT_DIR = os.path.abspath(os.path.join(__file__, "..", "..", "data", "traces"))
    if os.path.exists(OUTPUT_DIR):
        for file in os.listdir(OUTPUT_DIR):
            os.remove(os.path.join(OUTPUT_DIR, file))
    
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Load problems from both files
    all_problems = []
    
    # Load main problems
    try:
        with open(os.path.join(PROBLEM_DIR, "problems.json"), "r") as f:
            problems = json.load(f)['problems']
            all_problems.extend(problems)
            print(f"Loaded {len(problems)} problems from problems.json")
    except FileNotFoundError:
        print("problems.json not found")
    
    # Load lesson problems
    try:
        with open(os.path.join(PROBLEM_DIR, "lesson-problems.json"), "r") as f:
            lesson_problems = json.load(f)
            all_problems.extend(lesson_problems)
            print(f"Loaded {len(lesson_problems)} lessons from lesson-problems.json")
    except FileNotFoundError:
        print("lesson-problems.json not found")
    
    print(f"Total items to process: {len(all_problems)}")
    
    tracer = PythonTracer()
    for problem_key, problem in enumerate(all_problems):
        print(f"Processing {problem['id']}...")
        tracer.reset()  # Reset tracer state for each problem
        transformed_ast = tracer.run_code(
            problem['solution'], 
            problem['entrypoint'], 
            problem.get('special_inputs', None),
            problem_key,
            problem.get('manualRelationships', None),
            **problem['inputs']
        )
        tracer.save_results(os.path.join(OUTPUT_DIR, f"{problem['id']}.json"), transformed_ast)
    
    print("Done generating traces!")
    
    # Validate all generated trace files
    print(f"\n{'='*60}")
    print("🔍 VALIDATING GENERATED TRACES")
    print('='*60)
    
    success = validate_directory(OUTPUT_DIR)
    
    print(f"\n{'='*60}")
    if success:
        print("🎉 ALL TRACES GENERATED SUCCESSFULLY AND PASSED VALIDATION!")
    else:
        print("❌ SOME TRACES FAILED VALIDATION - CHECK OUTPUT ABOVE")
    print('='*60) 