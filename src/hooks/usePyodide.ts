import { loadPyodide } from 'pyodide';
import { useEffect, useRef, useState } from 'react';

import type { PyodideInterface } from "pyodide";

interface UsePyodideResult {
  pyodide: PyodideInterface | null;
  isLoading: boolean;
  error: string | null;
  loadTracer: () => Promise<void>;
  generateTrace: (
    problemCode: string,
    entrypoint: string,
    inputs: Record<string, any>
  ) => Promise<any>;
}

export function usePyodide(): UsePyodideResult {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    async function initializePyodide() {
      try {
        // Load Pyodide from npm package
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.6/full/",
        });

        // Install required packages
        await pyodideInstance.loadPackage(["micropip"]);

        setPyodide(pyodideInstance);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Pyodide");
        setIsLoading(false);
      }
    }

    initializePyodide();
  }, []);

  const loadTracer = async () => {
    if (!pyodide) throw new Error("Pyodide not ready");

    try {
      // Load all Python tracer files and register them as modules
      const files = [
        { name: "utils", path: "/tracer/utils.py" },
        { name: "ast_transformer", path: "/tracer/ast_transformer.py" },
        {
          name: "relationship_analyzer",
          path: "/tracer/relationship_analyzer.py",
        },
        { name: "python_tracer", path: "/tracer/python_tracer.py" },
      ];

      // Load and register each file as a module
      for (const file of files) {
        const code = await fetch(file.path).then((r) => r.text());

        // Register the module in sys.modules so it can be imported
        pyodide.runPython(`
import sys
import types

# Create a new module
module = types.ModuleType('${file.name}')
sys.modules['${file.name}'] = module

# Execute the code in the module's namespace
exec("""${code.replace(/"/g, '\\"')}""", module.__dict__)
        `);
      }

      console.log("All tracer modules loaded successfully");
    } catch (error) {
      console.error("Failed to load tracer modules:", error);
      throw error;
    }
  };

  const generateTrace = async (
    problemCode: string,
    entrypoint: string,
    inputs: Record<string, any>
  ) => {
    if (!pyodide) throw new Error("Pyodide not ready");

    try {
      // Set up the problem inputs with proper type conversion
      for (const [key, value] of Object.entries(inputs)) {
        pyodide.globals.set(key, value);
      }

      // Run the trace generation
      const traceGenCode = `
from python_tracer import PythonTracer
import json

# Initialize variables
result_json = None

try:
    tracer = PythonTracer()
    problem_code = """${problemCode.replace(/"/g, '\\"')}"""

    # Extract function name from code
    import ast
    tree = ast.parse(problem_code)
    function_name = "${entrypoint}"
    if function_name == "":
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                function_name = node.name
                break
    if function_name:
        # Get the input values from globals and ensure they're properly typed
        input_kwargs = {}
        for key in ${JSON.stringify(Object.keys(inputs))}:
            input_kwargs[key] = globals()[key]

        # Run the tracer with proper kwargs
        transformed_ast = tracer.run_code(
            problem_code, 
            function_name,
            **input_kwargs
        )
        
        # Get the trace data using the new method
        trace_data = tracer.get_trace_data(transformed_ast)
        result_json = json.dumps(trace_data)
    else:
        result_json = json.dumps({"error": "No function found in code"})
        
except Exception as e:
    result_json = json.dumps({"error": f"Python execution failed: {str(e)}"})

result_json
      `;

      const result = pyodide.runPython(traceGenCode);

      if (!result || result === "undefined") {
        throw new Error("Python code returned undefined result");
      }

      return JSON.parse(result);
    } catch (err) {
      throw new Error(`Trace generation failed: ${err}`);
    }
  };

  return {
    pyodide,
    isLoading,
    error,
    loadTracer,
    generateTrace,
  };
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}
