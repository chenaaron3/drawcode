import { useEffect, useState } from 'react';

import { getTraceData } from '@/data/traces';
import { useTraceStore } from '@/store/traceStore';

import { usePyodide } from './usePyodide';

export function useCodeInitialization() {
  const {
    setCurrentCode,
    setCurrentProblem,
    setTraceData,
    getCurrentProblemId,
  } = useTraceStore();
  const { isLoading: isPyodideLoading, generateTrace } = usePyodide();
  const [hasInitialized, setHasInitialized] = useState(false);
  const currentProblem = getCurrentProblemId();

  // When the page loads, check if there is code in the URL
  useEffect(() => {
    if (hasInitialized) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const encodedCode = urlParams.get("code");

    if (encodedCode) {
      if (isPyodideLoading) {
        return;
      }
      // Handle shared code from URL parameters
      try {
        const decodedCode = decodeURIComponent(atob(encodedCode));
        // Set the problem to sandbox so we can run whatever
        setCurrentProblem("sandbox");
        setCurrentCode(decodedCode);

        const generateTraceAsync = async () => {
          // Wrap just in case we get an invalid code
          try {
            const newTraceData = await generateTrace(decodedCode, "", {}, {});
            setTraceData(newTraceData);
          } finally {
            setCurrentProblem("two-sum");
            setHasInitialized(true);
            // Clear the URL parameter after loading
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);
          }
        };
        generateTraceAsync();
      } catch (error) {
        console.error("Failed to decode shared code:", error);
        // Fallback to default problem
        setCurrentProblem("two-sum");
        setHasInitialized(true);
      }
    } else {
      // Default to two-sum if no code param
      if (currentProblem === null) {
        setCurrentProblem("two-sum");
      }
      setHasInitialized(true);
    }
  }, [isPyodideLoading, hasInitialized, setCurrentCode, setCurrentProblem]);

  // Initialize trace data when problem changes
  useEffect(() => {
    console.log("currentProblem", currentProblem);
    const traceData = currentProblem ? getTraceData(currentProblem) : null;
    if (traceData) {
      setTraceData(traceData);
    }
  }, [currentProblem]);

  return {
    isInitializing: !hasInitialized,
  };
}
