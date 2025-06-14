/**
 * Checks if the stdout contains a specific string.
 * @param traceData - The trace data object.
 * @param str - The string to search for in stdout.
 * @returns True if the string is found in stdout, false otherwise.
 */
export function checkStdoutContains(traceData: any, str: string): boolean {
  return traceData?.metadata?.stdout?.includes(str) ?? false;
}

/**
 * Checks if a variable in finalLocals equals a specific value.
 * @param traceData - The trace data object.
 * @param varName - The variable name to check.
 * @param value - The value to compare against.
 * @returns True if the variable exists and equals the value, false otherwise.
 */
export function checkVariableEquals(
  traceData: any,
  varName: string,
  value: any
): boolean {
  return traceData?.metadata?.finalLocals?.[varName] === value;
}

/**
 * Recursively traverses the AST to find if a function call exists.
 * @param node - The current AST node.
 * @param functionName - The function name to search for.
 * @returns True if the function is called, false otherwise.
 */
function astHasFunctionCall(node: any, functionName: string): boolean {
  if (!node || typeof node !== "object") return false;

  // Check for Call node
  if (node.type === "Call" && node.func && node.func.id === functionName) {
    return true;
  }

  // Recursively check all properties
  for (const key in node) {
    if (node.hasOwnProperty(key)) {
      const value = node[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (astHasFunctionCall(item, functionName)) return true;
        }
      } else if (typeof value === "object" && value !== null) {
        if (astHasFunctionCall(value, functionName)) return true;
      }
    }
  }
  return false;
}

/**
 * Checks if a function is called in the AST.
 * @param traceData - The trace data object.
 * @param functionName - The function name to search for.
 * @returns True if the function is called, false otherwise.
 */
export function checkFunctionCalled(
  traceData: any,
  functionName: string
): boolean {
  const ast = traceData?.ast;
  if (!ast) return false;
  return astHasFunctionCall(ast, functionName);
}

import { useMemo } from "react";

/**
 * React hook utility: Checks if any terminal output contains a specific string.
 * Uses the useTerminalOutput hook internally.
 * @param str - The string to search for in terminal output.
 * @returns True if the string is found in any terminal output, false otherwise.
 * Usage: Call inside a React component or hook.
 */
import { useTerminalOutput } from "@/hooks/useTerminalOutput";
import { useTraceStore } from "@/store/traceStore";

export function useCheckTerminalOutputContains(str: string): boolean {
  const { terminalOutput } = useTerminalOutput();
  return useMemo(
    () => terminalOutput.some((item) => item.output.includes(str)),
    [terminalOutput, str]
  );
}

// Hook that checks if the user clicked to the end of the code
export function useTraceFinished(): boolean {
  const { hasNext } = useTraceStore();
  return !hasNext();
}
