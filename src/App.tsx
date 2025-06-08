import { useEffect } from 'react';

import { Toaster } from '@/components/ui/sonner';

import MainLayout from './components/MainLayout';
import lessonProblemsJson from './data/lesson-problems.json';
import problemDescriptionsData from './data/problem-descriptions.json';
import problemsJson from './data/problems.json';
import { useTraceStore } from './store/traceStore';
import { initGA, trackPageView } from './utils/analytics';

import type { Problem, ProblemDescription } from './types/problem';

export default function App() {
  const { setProblemsData } = useTraceStore();

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

  return (
    <>
      <MainLayout />
      <Toaster />
    </>
  );
}