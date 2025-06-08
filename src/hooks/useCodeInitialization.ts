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

  // When the page loads, check if there is code or problemId in the URL
  useEffect(() => {
    if (hasInitialized) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const encodedCode = urlParams.get("code");
    const problemId = urlParams.get("problemId");

    console.log("URL search params:", window.location.search);
    console.log("Detected problemId:", problemId);
    console.log("Detected code:", encodedCode ? "present" : "none");

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
    } else if (problemId) {
      // Handle problem ID from URL parameters
      console.log(`Attempting to load problem from URL: ${problemId}`);
      try {
        // Validate that the problem exists by checking if we have trace data for it
        const problemTraceData = getTraceData(problemId);
        console.log(`Trace data found for ${problemId}:`, !!problemTraceData);
        if (problemTraceData) {
          setCurrentProblem(problemId);
          console.log(`Successfully loaded problem from URL: ${problemId}`);
          // Clear the URL parameter after loading with a small delay
          setTimeout(() => {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);
          }, 100);
        } else {
          console.warn(
            `Problem ID "${problemId}" not found, falling back to default`
          );
          console.log(
            "Available problem IDs:",
            Object.keys(require("@/data/traces").TRACES)
          );
          setCurrentProblem("two-sum");
        }
      } catch (error) {
        console.error("Failed to load problem from URL:", error);
        setCurrentProblem("two-sum");
      }
      setHasInitialized(true);
    } else {
      // Default to two-sum if no code or problemId param
      if (currentProblem === null) {
        setCurrentProblem("two-sum");
      }
      setHasInitialized(true);
    }
  }, [
    isPyodideLoading,
    hasInitialized,
    setCurrentCode,
    setCurrentProblem,
    generateTrace,
    setTraceData,
  ]);

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
