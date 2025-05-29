import sys
import json
import ast
import builtins
import os

# Import the refactored classes
from python_tracer import PythonTracer

if __name__ == '__main__':
    PROBLEM_DIR = os.path.abspath(os.path.join(__file__, "..", ".."))
    OUTPUT_DIR = os.path.abspath(os.path.join(__file__, "..", "..", "traces"))
    
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    problems = []
    try:
        with open(os.path.join(PROBLEM_DIR, "problems.json"), "r") as f:
            problems = json.load(f)['problems']
    except FileNotFoundError:
        print("problems.json not found")
    
    tracer = PythonTracer()
    for problem in problems:
        # if problem['id'] != "two-sum":
        #     continue
        print(f"Processing problem {problem['id']}...")
        tracer.reset()  # Reset tracer state for each problem
        transformed_ast = tracer.run_code(
            problem['solution'], 
            problem['entrypoint'], 
            problem_number=problem['number'],
            problem_title=problem['title'],
            **problem['inputs']
        )
        tracer.save_results(os.path.join(OUTPUT_DIR, f"{problem['id']}.json"), transformed_ast)
    print("Done!") 
