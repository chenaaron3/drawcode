import { useEffect, useState } from 'react';

import MainLayout from '@/components/layout/MainLayout';
import { LandingPage } from '@/components/pages';
import { TutorialOverlay } from '@/components/tutorial';
import { Toaster } from '@/components/ui/sonner';
import lessonProblemsJson from '@/data/lesson-problems.json';
import problemDescriptionsData from '@/data/problem-descriptions.json';
import problemsJson from '@/data/problems.json';
import { useCodeInitialization } from '@/hooks/useCodeInitialization';
import { useTraceStore } from '@/store/traceStore';
import { initGA, trackPageView } from '@/utils/analytics';

import type { Problem, ProblemDescription } from '@/types/problem';

// Check if we're coming from a share entrypoint
const isShareEntrypoint = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return true;
  return urlParams.has('code') || urlParams.has('problemId');
};

export default function App() {
  const { setProblemsData } = useTraceStore();
  const { isInitializing } = useCodeInitialization();
  const [showLanding, setShowLanding] = useState(!isShareEntrypoint());

  // Initialize Google Analytics and load problems data
  useEffect(() => {
    // Initialize Google Analytics
    initGA();

    // Track initial page view
    trackPageView('/app', 'Python Visualizer - Interactive Learning Platform');

    const loadProblemsWithDescriptions = async () => {
      try {
        const problemDescriptions = problemDescriptionsData as Record<string, ProblemDescription>;

        // Combine regular problems and lesson problems
        const allProblems = [...problemsJson.problems, ...lessonProblemsJson];

        // Join problems with descriptions (check both problem and lesson descriptions)
        const problemsWithDetails = allProblems.map(problem => ({
          ...problem,
          details: problemDescriptions[problem.id] || null
        })) as Problem[];

        setProblemsData(problemsWithDetails);
      } catch (error) {
        console.error('Error loading problem descriptions:', error);
        // Fallback to just the problems data without descriptions
        const allProblems = [...problemsJson.problems, ...lessonProblemsJson];
        const problemsWithoutDetails = allProblems.map(problem => ({
          ...problem,
          details: null
        })) as any[];
        setProblemsData(problemsWithoutDetails);
      }
    };

    loadProblemsWithDescriptions();
  }, [setProblemsData]);


  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show landing page if user hasn't started yet
  if (showLanding) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowLanding(false)} />
        <Toaster richColors />
      </>
    );
  }

  return (
    <>
      <MainLayout />
      <TutorialOverlay />
      <Toaster richColors />
    </>
  );
}