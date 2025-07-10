import { useEffect, useState } from 'react';

import { selectCurrentLine, useTraceStore } from '@/store/traceStore';

import type { AugmentedTraceStep } from "@/types/trace";
export const useAugmentedSteps = () => {
  const currentLine = useTraceStore(selectCurrentLine);
  const nodeLookup = useTraceStore((state) => state.nodeLookup);
  const [steps, setSteps] = useState<AugmentedTraceStep[] | null>(null);

  useEffect(() => {
    if (currentLine !== null && nodeLookup !== null) {
      setSteps(
        currentLine.steps.map((step) => ({
          ...step,
          ast: nodeLookup.get(step.node_id)!,
        })),
      );
    }
  }, [currentLine, nodeLookup]);

  return steps;
};
