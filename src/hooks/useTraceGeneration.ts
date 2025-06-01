import { useState } from 'react';
import { toast } from 'sonner';

import { useTraceStore } from '@/store/traceStore';

import { usePyodide } from './usePyodide';

export function useTraceGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateTrace } = usePyodide();
  const {
    getCurrentProblemData,
    getCurrentProblemId,
    setTraceData,
    getInputOverrides,
    setValidationError,
    setGeneralError,
    clearError,
    traceData,
  } = useTraceStore();

  const generateTraceFromState = async () => {
    const currentProblemId = getCurrentProblemId();
    if (!currentProblemId) return false;

    const problemData = getCurrentProblemData(currentProblemId);
    if (!problemData) return false;

    // Get current code from trace data (could be edited)
    const currentCode = traceData?.metadata.code || problemData.solution;
    if (!currentCode) return false;

    setIsGenerating(true);
    clearError();

    try {
      // Combine original inputs with overrides (same logic as TraceControls)
      const currentInputs = {
        ...traceData?.metadata.inputs.kwargs,
        ...getInputOverrides(),
      };

      const newTraceData = await generateTrace(
        currentCode,
        problemData.entrypoint,
        currentInputs,
        problemData.inputs // Pass original inputs for type inference
      );

      if (newTraceData.error) {
        if (newTraceData.validationError && newTraceData.invalidField) {
          // Handle validation errors
          setValidationError({
            message: newTraceData.error,
            invalidField: newTraceData.invalidField,
          });
        } else {
          // Handle other errors
          setGeneralError(newTraceData.error);
        }
        return false;
      } else {
        setTraceData(newTraceData);
        toast.success("Trace generated successfully!");
        return true;
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error ? err.message : "Failed to generate trace"
      );
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateTraceFromState,
    isGenerating,
  };
}
