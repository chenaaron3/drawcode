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
    currentCode,
  } = useTraceStore();

  const generateTraceFromState = async () => {
    const currentProblemId = getCurrentProblemId();
    if (!currentProblemId) return false;

    const problemData = getCurrentProblemData(currentProblemId);
    if (!problemData) return false;

    // Get current code from store (could be edited) - use currentCode from store instead of traceData.metadata.code
    const codeToExecute =
      currentCode || traceData?.metadata.code || problemData.solution;
    if (!codeToExecute) return false;

    setIsGenerating(true);
    clearError();

    try {
      const currentInputs = {
        ...traceData?.metadata.inputs.kwargs,
        ...getInputOverrides(),
      };

      const newTraceData = await generateTrace(
        codeToExecute,
        problemData.entrypoint,
        currentInputs,
        problemData.inputs, // Pass original inputs for type inference
        problemData.special_inputs // Pass the full problem data including special_inputs
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
