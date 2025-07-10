import type { PyodideInterface } from "pyodide";
import { useCallback, useEffect, useRef, useState } from 'react';

import astTransformerCode from '@/tracer/ast_transformer.py';
import pythonTracerCode from '@/tracer/python_tracer.py';
import relationshipAnalyzerCode from '@/tracer/relationship_analyzer.py';
import utilsCode from '@/tracer/utils.py';

import { usePyodideScript } from './usePyodideInstance';

import type { SpecialInput } from "@/types/problem";
import type { ManualRelationship } from "@/types/trace";

interface UsePyodideResult {
  pyodide: PyodideInterface | null;
  isLoading: boolean;
  generateTrace: (
    problemCode: string,
    entrypoint: string,
    inputs: Record<string, any>,
    originalInputs: Record<string, any>,
    specialInputs?: SpecialInput[],
    manualRelationships?: Array<ManualRelationship>,
  ) => Promise<any>;
  resetPyodide: () => Promise<void>;
}

export function usePyodide(): UsePyodideResult {
  const { pyodideScriptLoading } = usePyodideScript();
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializing = useRef(false);

  // Shared tracer files configuration
  const TRACER_FILES = [
    { name: "utils", code: utilsCode },
    { name: "ast_transformer", code: astTransformerCode },
    { name: "relationship_analyzer", code: relationshipAnalyzerCode },
    { name: "python_tracer", code: pythonTracerCode },
  ];

  useEffect(() => {
    if (pyodideScriptLoading) return;
    if (isInitializing.current) return;
    isInitializing.current = true;

    async function initializePyodide() {
      await resetPyodide();
    }

    initializePyodide();
  }, [pyodideScriptLoading]);

  const loadTracer = async (pyodide: PyodideInterface) => {
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
      const pyodide = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      });
      await pyodide.loadPackage(["micropip"]);
      setPyodide(pyodide);

      setIsLoading(false);

      // Use the existing loadTracer function to load modules
      await loadTracer(pyodide);

      console.log("Pyodide reset complete with fresh tracer modules");
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to reset Pyodide:", error);
      throw error;
    }
  };

  // Helper function to convert a value to match the type of the original value
  const convertToOriginalType = (
    value: any,
    originalValue: any,
    fieldName: string,
  ): any => {
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
          if (!Array.isArray(parsed)) {
            throw new Error(
              `Field '${fieldName}' conversion failed: expected array format`,
            );
          }
          return parsed;
        } catch {
          throw new Error(
            `Field '${fieldName}' conversion failed: cannot parse as array`,
          );
        }
      }
      if (!Array.isArray(value)) {
        throw new Error(
          `Field '${fieldName}' conversion failed: expected array format`,
        );
      }
      return value;
    }

    // Handle other types
    switch (originalType) {
      case "number":
        if (typeof value === "string") {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            throw new Error(
              `Field '${fieldName}' conversion failed: invalid number format`,
            );
          }
          return numValue;
        }
        if (typeof value !== "number") {
          throw new Error(
            `Field '${fieldName}' conversion failed: expected number`,
          );
        }
        return value;

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
      originalInputs: Record<string, any>,
      specialInputs?: SpecialInput[],
      manualRelationships?: Array<{
        container: string;
        cursor: string;
        type: string;
        description?: string;
      }>,
    ) => {
      try {
        // Option 3: Complete reset for maximum cleanliness
        console.log("Performing complete Pyodide reset...");
        await resetPyodide();

        // Wait a moment for reset to complete and get fresh instance
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the current pyodide instance after reset
        const currentPyodide = pyodide;
        if (!currentPyodide) throw new Error("Pyodide reset failed");

        console.log("Inputs:", inputs);
        console.log("Original inputs:", originalInputs);

        // Parse inputs using original types for guidance
        const parsedInputs: Record<string, any> = {};
        for (const [key, value] of Object.entries(inputs)) {
          const originalValue = originalInputs[key];
          try {
            parsedInputs[key] = convertToOriginalType(
              value,
              originalValue,
              key,
            );
          } catch (error) {
            // Return validation error that includes field information
            return {
              error:
                error instanceof Error
                  ? error.message
                  : `Field '${key}' validation failed`,
              validationError: true,
              invalidField: key,
            };
          }
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

    # Get all defined functions
    defined_functions = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            defined_functions.append(node.name)
    
    # If the provided function name does not exist, maybe the code calls the function directly
    if function_name not in defined_functions:
        function_name = None

    # Get the input values directly from globals
    input_kwargs = {${Object.entries(inputs)
      .map(([key, _]) => `"${key}": ${key}`)
      .join(", ")}}
    
    print(f"Function: {function_name}")
    print(f"Input kwargs: {input_kwargs}")

    # Get special_inputs from problem if available
    special_inputs = ${specialInputs ? JSON.stringify(specialInputs) : "None"}
    
    # Get manual_relationships from problem if available
    manual_relationships = ${
      manualRelationships ? JSON.stringify(manualRelationships) : "None"
    }
    
    # Run the tracer with explicit kwargs
    transformed_ast = tracer.run_code(
        problem_code, 
        function_name,
        special_inputs,
        hash(problem_code), # hash of the source code
        manual_relationships,
        **input_kwargs
    )
    
    # Get the trace data using the new method
    trace_data = tracer.get_trace_data(transformed_ast)
    result_json = json.dumps(trace_data)
        
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
    [pyodide, convertToOriginalType],
  );

  return {
    pyodide,
    isLoading,
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
