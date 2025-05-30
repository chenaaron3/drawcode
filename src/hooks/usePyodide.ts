import { loadPyodide } from 'pyodide';
import { useCallback, useEffect, useRef, useState } from 'react';

import astTransformerCode from '../tracer/ast_transformer.py?raw';
import pythonTracerCode from '../tracer/python_tracer.py?raw';
import relationshipAnalyzerCode from '../tracer/relationship_analyzer.py?raw';
// Import Python tracer files as raw text
import utilsCode from '../tracer/utils.py?raw';

import type { PyodideInterface } from "pyodide";

interface UsePyodideResult {
  pyodide: PyodideInterface | null;
  isLoading: boolean;
  error: string | null;
  loadTracer: () => Promise<void>;
  generateTrace: (
    problemCode: string,
    entrypoint: string,
    inputs: Record<string, any>,
    originalInputs: Record<string, any>
  ) => Promise<any>;
  resetPyodide: () => Promise<void>;
}

export function usePyodide(): UsePyodideResult {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitializing = useRef(false);

  // Shared tracer files configuration
  const TRACER_FILES = [
    { name: "utils", code: utilsCode },
    { name: "ast_transformer", code: astTransformerCode },
    { name: "relationship_analyzer", code: relationshipAnalyzerCode },
    { name: "python_tracer", code: pythonTracerCode },
  ];

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
      for (const file of TRACER_FILES) {
        // Register the module in sys.modules so it can be imported
        pyodide.runPython(`
import sys
import types

# Create a new module
module = types.ModuleType('${file.name}')
sys.modules['${file.name}'] = module

# Execute the code in the module's namespace
exec("""${file.code.replace(/"/g, '\\"')}""", module.__dict__)
        `);
      }
      console.log("All tracer modules loaded successfully");
    } catch (error) {
      console.error("Failed to load tracer modules:", error);
      throw error;
    }
  };

  // Optional: Complete Pyodide reset (more expensive but thorough)
  const resetPyodide = async () => {
    console.log("Starting complete Pyodide reset...");
    setIsLoading(true);

    try {
      const pyodideInstance = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.6/full/",
      });

      await pyodideInstance.loadPackage(["micropip"]);
      setPyodide(pyodideInstance);

      setIsLoading(false);

      // Use the existing loadTracer function to load modules
      await loadTracer();

      console.log("Pyodide reset complete with fresh tracer modules");
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to reset Pyodide:", error);
      throw error;
    }
  };

  // Helper function to convert a value to match the type of the original value
  const convertToOriginalType = (value: any, originalValue: any): any => {
    // If the original value is null/undefined, return as-is
    if (originalValue == null) {
      return value;
    }

    const originalType = typeof originalValue;

    // If value is already the correct type, return as-is
    if (typeof value === originalType && !Array.isArray(originalValue)) {
      return value;
    }

    // Handle arrays specifically
    if (Array.isArray(originalValue)) {
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : originalValue;
        } catch {
          return originalValue;
        }
      }
      return Array.isArray(value) ? value : originalValue;
    }

    // Handle other types
    switch (originalType) {
      case "number":
        if (typeof value === "string") {
          const numValue = Number(value);
          return isNaN(numValue) ? originalValue : numValue;
        }
        return typeof value === "number" ? value : originalValue;

      case "boolean":
        if (typeof value === "string") {
          return value.toLowerCase() === "true";
        }
        return Boolean(value);

      case "string":
        // Remove quotes if it's a quoted string
        if (typeof value === "string") {
          if (
            (value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))
          ) {
            return value.slice(1, -1);
          }
        }
        return String(value);

      default:
        return value;
    }
  };

  const generateTrace = useCallback(
    async (
      problemCode: string,
      entrypoint: string,
      inputs: Record<string, any>,
      originalInputs: Record<string, any>
    ) => {
      try {
        // Option 3: Complete reset for maximum cleanliness
        console.log("Performing complete Pyodide reset...");
        await resetPyodide();

        // Wait a moment for reset to complete and get fresh instance
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Get the current pyodide instance after reset
        const currentPyodide = pyodide;
        if (!currentPyodide) throw new Error("Pyodide reset failed");

        console.log("Inputs:", inputs);
        console.log("Original inputs:", originalInputs);

        // Parse inputs using original types for guidance
        const parsedInputs: Record<string, any> = {};
        for (const [key, value] of Object.entries(inputs)) {
          const originalValue = originalInputs[key];
          parsedInputs[key] = convertToOriginalType(value, originalValue);
        }

        console.log("Parsed inputs:", parsedInputs);

        // Convert inputs to Python objects using toPy
        const pythonGlobals = currentPyodide.toPy(parsedInputs);

        // Run the trace generation with proper globals
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
        # Get the input values directly from globals
        input_kwargs = {${Object.entries(inputs)
          .map(([key, _]) => `"${key}": ${key}`)
          .join(", ")}}
        
        print(f"Function: {function_name}")
        print(f"Input kwargs: {input_kwargs}")

        # Run the tracer with explicit kwargs
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

        const result = currentPyodide.runPython(traceGenCode, {
          globals: pythonGlobals,
        });

        if (!result || result === "undefined") {
          throw new Error("Python code returned undefined result");
        }

        return JSON.parse(result);
      } catch (err) {
        throw new Error(`Trace generation failed: ${err}`);
      }
    },
    [pyodide, convertToOriginalType]
  );

  return {
    pyodide,
    isLoading,
    error,
    loadTracer,
    generateTrace,
    resetPyodide,
  };
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}
