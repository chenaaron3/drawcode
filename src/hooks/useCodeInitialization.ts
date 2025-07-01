import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import lessonProblemsData from '@/data/lesson-problems.json';
import { getTraceData } from '@/data/traces';
import { useTraceStore } from '@/store/traceStore';

import { useLessonNavigation } from './useLessonNavigation';
import { usePyodide } from './usePyodide';

// Helper function to check if a problemId is a lesson
function isLessonId(problemId: string): boolean {
  return lessonProblemsData.some((lesson) => lesson.id === problemId);
}

// Helper function to determine the correct route for a problem
function getProblemRoute(problemId: string): string {
  // Sandbox always goes to playground
  if (problemId === "sandbox") {
    return "/sandbox";
  }
  // Check if it's a lesson
  return isLessonId(problemId) ? "/lesson" : "/sandbox";
}

export function useCodeInitialization() {
  const router = useRouter();
  const {
    setCurrentCode,
    setCurrentProblem,
    setTraceData,
    getCurrentProblemId,
  } = useTraceStore();
  const { isLoading: isPyodideLoading, generateTrace } = usePyodide();
  const [hasInitialized, setHasInitialized] = useState(false);
  const currentProblem = getCurrentProblemId();
  const { gotoDefaultLesson } = useLessonNavigation();

  // When the page loads, check if there is code or problemId in the URL
  useEffect(() => {
    if (hasInitialized) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const encodedCode = urlParams.get("code");
    const problemId = urlParams.get("problemId");

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

        // Sandbox always goes to playground mode
        router.push("/sandbox");

        const generateTraceAsync = async () => {
          // Wrap just in case we get an invalid code
          try {
            const newTraceData = await generateTrace(decodedCode, "", {}, {});
            setTraceData(newTraceData);
          } catch (error) {
            // Fallback to two-sum if compilation fails
            setCurrentProblem("two-sum");
            router.push("/sandbox");
          } finally {
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
        router.push("/sandbox");
        setHasInitialized(true);
      }
    } else if (problemId) {
      // Handle problem ID from URL parameters
      try {
        // Validate that the problem exists by checking if we have trace data for it
        const problemTraceData = getTraceData(problemId);
        console.log("problemTraceData", problemTraceData);
        if (problemTraceData) {
          // Set the correct route based on whether it's a lesson, practice, or playground
          const correctRoute = getProblemRoute(problemId);
          router.push(correctRoute);

          setCurrentProblem(problemId);
          // Clear the URL parameter after loading with a small delay
          setTimeout(() => {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);
          }, 100);
        } else {
          setCurrentProblem("two-sum");
          // Default to sandbox for fallback
          router.push("/sandbox");
        }
      } catch (error) {
        console.error("Failed to load problem from URL:", error);
        setCurrentProblem("two-sum");
        // Default to sandbox for error case
        router.push("/sandbox");
      }
      setHasInitialized(true);
    } else {
      // Default initialization
      if (router.pathname === "/sandbox") {
        // No problem selected - default to two-sum
        setCurrentProblem("sandbox");
      } else if (router.pathname === "/lesson") {
        // Auto-redirect to last uncompleted lesson if available
        gotoDefaultLesson();
      } else if (router.pathname === "/") {
        // Defer to Demo Panel
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
    currentProblem,
    router,
  ]);

  // Initialize trace data when problem changes
  useEffect(() => {
    console.log("currentProblem", currentProblem);
    const traceData = currentProblem ? getTraceData(currentProblem) : null;
    console.log(traceData);
    if (traceData) {
      setTraceData(traceData);
    }
  }, [currentProblem, setTraceData]);

  return {
    isInitializing: !hasInitialized,
  };
}
