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
    
    problems = []
    try:
        with open(os.path.join(PROBLEM_DIR, "problems.json"), "r") as f:
            problems = json.load(f)['problems']
    except FileNotFoundError:
        print("problems.json not found")
    
    tracer = PythonTracer()
    for problem_key, problem in enumerate(problems):
        print(f"Processing problem {problem['id']}...")
        tracer.reset()  # Reset tracer state for each problem
        transformed_ast = tracer.run_code(
            problem['solution'], 
            problem['entrypoint'], 
            problem_key,
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