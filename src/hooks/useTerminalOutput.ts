import { useMemo } from 'react';

import { useTraceStore } from '../store/traceStore';

export interface TerminalOutputItem {
  line: number;
  output: string;
}

export interface UseTerminalOutputResult {
  terminalOutput: TerminalOutputItem[];
  hasTerminalOutput: boolean;
}

// Helper function to extract print output from trace steps
const extractPrintOutputFromSteps = (
  steps: any[],
  printStatementIndex: number
): string => {
  try {
    const values: string[] = [];

    // Look backwards from the print statement to find the argument values
    for (let i = printStatementIndex - 1; i >= 0; i--) {
      const step = steps[i];

      // Stop when we hit the print's before_expression (start of this print call)
      if (
        step.focus &&
        step.focus.includes("print(") &&
        step.event === "before_expression"
      ) {
        break;
      }

      // Collect after_expression values (these are the print arguments)
      if (step.event === "after_expression" && step.value !== undefined) {
        // Add to the beginning since we're going backwards
        values.unshift(String(step.value));
      }
    }

    return values.join(" ");
  } catch (error) {
    return "";
  }
};

export const useTerminalOutput = (): UseTerminalOutputResult => {
  const { traceData, lineIndex, stepIndex } = useTraceStore();

  const result = useMemo(() => {
    if (!traceData) {
      return {
        terminalOutput: [],
        hasTerminalOutput: false,
      };
    }

    // Extract print statements and their outputs from the trace
    const outputs: TerminalOutputItem[] = [];

    // Go through each trace line up to the current position
    for (let i = 0; i <= lineIndex && i < traceData.trace.length; i++) {
      const traceLine = traceData.trace[i];

      // Determine how many steps to check on this line
      const stepsToCheck =
        i === lineIndex ? stepIndex + 1 : traceLine.steps.length;

      // Look through the steps we've executed on this line
      for (
        let stepIdx = 0;
        stepIdx < stepsToCheck && stepIdx < traceLine.steps.length;
        stepIdx++
      ) {
        const step = traceLine.steps[stepIdx];

        // Only add to terminal when we reach the after_statement of a print
        if (
          step.focus &&
          step.focus.startsWith("print(") &&
          step.event === "after_statement"
        ) {
          const output = extractPrintOutputFromSteps(traceLine.steps, stepIdx);
          if (output) {
            outputs.push({
              line: traceLine.line_number,
              output: output,
            });
          }
        }
      }
    }

    return {
      terminalOutput: outputs,
      hasTerminalOutput: outputs.length > 0,
    };
  }, [traceData, lineIndex, stepIndex]);

  return result;
};

export default useTerminalOutput;
