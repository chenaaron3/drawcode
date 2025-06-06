import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Toaster } from '@/components/ui/sonner';

import Header from './components/Header';
import problemDescriptionsData from './data/problem-descriptions.json';
import problemsJson from './data/problems.json';
import DebuggerPage from './pages/DebuggerPage';
import ProblemPage from './pages/ProblemPage';
import RoadmapPage from './pages/RoadmapPage';
import { useTraceStore } from './store/traceStore';

import type { ProblemDescription } from './types/problem';

export default function App() {
  const { setProblemsData } = useTraceStore();

  // Load problems data on app initialization
  useEffect(() => {
    const loadProblemsWithDescriptions = async () => {
      try {
        const problemDescriptions = problemDescriptionsData as Record<string, ProblemDescription>;
        // Join problems with descriptions
        const problemsWithDetails = problemsJson.problems.map(problem => ({
          ...problem,
          details: problemDescriptions[problem.id] || null
        }));

        setProblemsData(problemsWithDetails);
      } catch (error) {
        console.error('Error loading problem descriptions:', error);
        // Fallback to just the problems data without descriptions
        const problemsWithoutDetails = problemsJson.problems.map(problem => ({
          ...problem,
          details: null
        }));
        setProblemsData(problemsWithoutDetails);
      }
    };

    loadProblemsWithDescriptions();
  }, [setProblemsData]);

  return (
    <BrowserRouter>
      <div className="min-h-screen overflow-visible h-screen bg-background flex flex-col">
        <Header />

        <Routes>
          {/* Set default to two-sum problem */}
          <Route path="/" element={<Navigate to="/problem/two-sum" replace />} />
          <Route path="/debugger" element={<DebuggerPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/problem/:problemId" element={<ProblemPage />} />
        </Routes>

        <Toaster />
      </div>
    </BrowserRouter>
  );
}