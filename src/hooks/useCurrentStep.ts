import { useEffect, useState } from 'react';

import { selectCurrentLine, useTraceStore } from '@/store/traceStore';

import type { AugmentedTraceStep } from "@/types/trace";

export function useCurrentStep(): AugmentedTraceStep | null {
  const currentLine = useTraceStore(selectCurrentLine);
  const nodeLookup = useTraceStore((state) => state.nodeLookup);
  const stepIndex = useTraceStore((state) => state.stepIndex);
  const [currentStep, setCurrentStep] = useState<AugmentedTraceStep | null>(
    null,
  );

  useEffect(() => {
    if (
      currentLine !== null &&
      nodeLookup !== null &&
      currentLine.steps[stepIndex]
    ) {
      const newStep = {
        ...currentLine.steps[stepIndex],
        ast: nodeLookup.get(currentLine.steps[stepIndex].node_id)!,
      };
      setCurrentStep(newStep);
    } else {
      setCurrentStep(null);
    }
  }, [currentLine, nodeLookup, stepIndex]);

  return currentStep;
}
