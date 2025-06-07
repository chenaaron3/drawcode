import { useEffect, useState } from 'react';

import { Toaster } from '@/components/ui/sonner';

import Header from './components/Header';
import problemDescriptionsData from './data/problem-descriptions.json';
import problemsJson from './data/problems.json';
import DebuggerPage from './pages/DebuggerPage';
import RoadmapPage from './pages/RoadmapPage';
import { useTraceStore } from './store/traceStore';
import { initGA, trackPageView, trackViewChange } from './utils/analytics';

import type { ProblemDescription } from './types/problem';

type ViewType = 'roadmap' | 'debugger';

export default function App() {
  const { setProblemsData } = useTraceStore();
  const [currentView, setCurrentView] = useState<ViewType>('debugger');

  // Initialize Google Analytics and load problems data
  useEffect(() => {
    // Initialize Google Analytics
    initGA();

    // Track initial page view
    trackPageView('/debugger', 'Debugger - Leetcode Guide');

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

  const handleViewChange = (view: ViewType) => {
    const previousView = currentView;
    setCurrentView(view);

    // Track view change
    trackViewChange(previousView, view);
    trackPageView(`/${view}`, `${view.charAt(0).toUpperCase() + view.slice(1)} - Leetcode Guide`);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'roadmap':
        return <RoadmapPage onNavigateToDebugger={() => setCurrentView('debugger')} />;
      case 'debugger':
        return <DebuggerPage />;
      default:
        return <RoadmapPage onNavigateToDebugger={() => setCurrentView('debugger')} />;
    }
  };

  return (
    <div className="min-h-screen overflow-visible h-screen bg-background flex flex-col">
      <Header currentView={currentView} onViewChange={handleViewChange} />
      {renderCurrentView()}
      <Toaster />
    </div>
  );
}