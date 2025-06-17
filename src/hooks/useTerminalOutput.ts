import { useMemo } from 'react';

import { useTraceStore } from '@/store/traceStore';

export interface TerminalOutputItem {
  line: number;
  output: string;
}

export interface UseTerminalOutputResult {
  terminalOutput: TerminalOutputItem[];
  hasTerminalOutput: boolean;
}

export const useTerminalOutput = (): UseTerminalOutputResult => {
  const { traceData, lineIndex, stepIndex } = useTraceStore();

  const result = useMemo(() => {
    if (!traceData) {
      return {
        terminalOutput: [],
        hasTerminalOutput: false,
      };
    }

    // Extract stdout output directly from trace steps
    const outputs: TerminalOutputItem[] = [];

    // Go through each trace line up to the current position
    for (let i = 0; i <= lineIndex && i < traceData.trace.length; i++) {
      const traceLine = traceData.trace[i]!;

      // Determine how many steps to check on this line
      const stepsToCheck =
        i === lineIndex ? stepIndex + 1 : traceLine.steps.length;

      // Look through the steps we've executed on this line
      for (
        let stepIdx = 0;
        stepIdx < stepsToCheck && stepIdx < traceLine.steps.length;
        stepIdx++
      ) {
        const step = traceLine.steps[stepIdx]!;

        // If this step has stdout output, add it to our outputs
        if (step.stdout && step.stdout.trim()) {
          outputs.push({
            line: traceLine.line_number,
            output: step.stdout.trim(),
          });
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
