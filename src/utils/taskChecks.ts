import { useMemo } from 'react';

import useTerminalOutput from '@/hooks/useTerminalOutput';
import { useTraceStore } from '@/store/traceStore';

export function useTerminalContainsAll(strs: string[]): boolean {
  const { terminalOutput } = useTerminalOutput();
  return useMemo(
    () =>
      strs.every((str) =>
        terminalOutput.some((item) => item.output.includes(str)),
      ),
    [terminalOutput, strs],
  );
}

// Hook that checks if the user clicked to the end of the code
export function useTraceFinished(): boolean {
  const { hasNext, stepIndex, lineIndex } = useTraceStore();
  return !hasNext() && stepIndex + lineIndex > 0;
}

// Hook that checks if local variables are defined, optionally with a value
export function useVariablesDefined(values: Record<string, any>): boolean {
  const { traceData } = useTraceStore();
  return Object.entries(values).every(([varName, value]) => {
    // Undefined means we can have any value
    if (value === undefined) {
      return traceData?.metadata?.finalLocals?.[varName] !== undefined;
    } else {
      // Null means it has to be empty
      if (value === null) {
        return (
          traceData?.metadata?.finalLocals?.[varName] === null ||
          traceData?.metadata?.finalLocals?.[varName] === undefined
        );
      }
      // Otherwise check for value equality
      return traceData?.metadata?.finalLocals?.[varName] === value;
    }
  });
}

// Checks if variables are printed in the terminal
export function useVariablesPrinted(variables: string[]): boolean {
  const { terminalOutput } = useTerminalOutput();
  const { traceData } = useTraceStore();
  return variables.every((varName) => {
    // Get the variable value from the local
    const varValue = traceData?.metadata?.finalLocals?.[varName];
    if (!varValue) return false;
    return terminalOutput.some((item) => item.output.includes(varValue));
  });
}
