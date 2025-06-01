import { useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';

import problemDescriptionsData from '../public/problem-descriptions.json';
import problemsJson from '../public/problems.json';
import { NavigationControls } from './components/NavigationControls';
import TraceVisualizer from './components/TraceVisualizer';
import { AVAILABLE_PROBLEM_IDS, getTraceData } from './data/traces';
import { usePyodide } from './hooks/usePyodide';
import { useTraceStore } from './store/traceStore';

import type { ProblemDescription } from './types/problem';

function formatTraceName(problemId: string): string {
  const problemData = problemsJson.problems.find(p => p.id === problemId);
  if (problemData?.title) {
    return problemData.number + ". " + problemData.title;
  }

  // Fallback to original formatting if no problem data
  return problemId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function getSortedProblemIds(): string[] {
  return AVAILABLE_PROBLEM_IDS.sort((a, b) => {
    const traceDataA = getTraceData(a);
    const traceDataB = getTraceData(b);

    const numberA = traceDataA?.metadata?.problem?.number;
    const numberB = traceDataB?.metadata?.problem?.number;

    // If both have problem numbers, sort by number
    if (numberA !== undefined && numberB !== undefined) {
      return numberA - numberB;
    }

    // If only one has a problem number, put it first
    if (numberA !== undefined && numberB === undefined) return -1;
    if (numberA === undefined && numberB !== undefined) return 1;

    // If neither has a problem number, sort alphabetically
    return a.localeCompare(b);
  });
}

interface HeaderProps {
  currentProblemId: string | null;
  onProblemChange: (problemId: string) => void;
}

function Header({ currentProblemId, onProblemChange }: HeaderProps) {
  const sortedProblemIds = getSortedProblemIds();

  return (
    <>
      {/* Main Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto p-2 lg:p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:gap-0 lg:relative lg:items-center lg:justify-between">
            {/* Title and Mobile Problem Selector */}
            <div className="flex items-center justify-between lg:justify-start">
              <h1 className="text-lg lg:text-xl lg:text-2xl font-bold text-foreground">
                Leetcode Debugger
              </h1>

              {/* Mobile: Problem selector on the right */}
              <div className="lg:hidden flex items-center">
                <Select value={currentProblemId || ''} onValueChange={onProblemChange}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedProblemIds.map(problemId => (
                      <SelectItem key={problemId} value={problemId}>
                        {formatTraceName(problemId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Desktop: Navigation Controls (centered) */}
            <div className="hidden lg:flex lg:absolute lg:left-1/2 lg:top-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2">
              <NavigationControls />
            </div>

            {/* Desktop: Problem selector with label */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Select problem:
              </span>
              <Select value={currentProblemId || ''} onValueChange={onProblemChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortedProblemIds.map(problemId => (
                    <SelectItem key={problemId} value={problemId}>
                      {formatTraceName(problemId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky Navigation Controls */}
      <div className="sticky top-0 z-50 lg:hidden bg-card border-b border-border/50 shadow-sm">
        <div className="container mx-auto p-2">
          <div className="flex justify-center">
            <NavigationControls />
          </div>
        </div>
      </div>
    </>
  );
}

interface ErrorDisplayProps {
  error: string;
}

function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <Card className="border-l-4 border-l-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">
          Error Loading Trace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{error}</p>
      </CardContent>
    </Card>
  );
}

export default function App() {
  const {
    setProblemsData,
    getCurrentProblemId,
    setCurrentProblem,
    setCurrentCode,
    setTraceData
  } = useTraceStore();

  const { generateTrace, isLoading: pyodideLoading } = usePyodide();
  const currentProblemId = getCurrentProblemId();

  // Check for shared code in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');

    // Load and join problems with their descriptions
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

    if (codeParam) {
      try {
        // Decode the base64 encoded code
        const decodedCode = decodeURIComponent(atob(codeParam));
        console.log('Shared code detected:', decodedCode);

        // Set to first problem (index 0) when loading shared code
        setCurrentProblem('sandbox');
        setCurrentCode(decodedCode);
        return; // Exit early to avoid normal initialization
      } catch (err) {
        console.error('Failed to decode shared code:', err);
      }
    } else {
      if (!currentProblemId) {
        setCurrentProblem('two-sum');
      }
    }
  }, [setProblemsData, setCurrentProblem, setCurrentCode, currentProblemId]);

  // Auto-compile shared code when Pyodide is ready
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');

    if (codeParam && !pyodideLoading) {
      const compileSharedCode = async () => {
        try {
          const decodedCode = decodeURIComponent(atob(codeParam));
          const problemData = problemsJson.problems.find(p => p.id === 'sandbox');

          if (problemData) {
            console.log('Pyodide ready, compiling shared code...');
            const traceData = await generateTrace(
              decodedCode,
              problemData.entrypoint,
              problemData.inputs,
              problemData.inputs
            );

            if (!traceData.error) {
              setTraceData(traceData);
              console.log('Shared code compiled successfully');
            } else {
              console.error('Error compiling shared code:', traceData.error);
            }
          }
        } catch (err) {
          console.error('Failed to compile shared code:', err);
        }
      };

      compileSharedCode();
      // Clear the URL parameter to avoid reloading the shared code on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [pyodideLoading, generateTrace, setTraceData]);

  const handleProblemChange = (problemId: string) => {
    setCurrentProblem(problemId);
  };

  return (
    <div className="min-h-screen overflow-visible h-screen bg-background flex flex-col">
      <Header
        currentProblemId={currentProblemId}
        onProblemChange={handleProblemChange}
      />

      <div className="px-4 lg:px-24 w-full p-6 my-auto min-h-[calc(100vh-120px)] lg:h-[90vh] overflow-visible">
        {currentProblemId ? (
          <TraceVisualizer />
        ) : (
          <ErrorDisplay error="No problem selected" />
        )}
      </div>

      <Toaster />
    </div>
  );
}