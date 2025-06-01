import { useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';

import problemsJson from '../public/problems.json';
import TraceVisualizer from './components/TraceVisualizer';
import { AVAILABLE_PROBLEM_IDS, getTraceData } from './data/traces';
import { usePyodide } from './hooks/usePyodide';
import { useTraceStore } from './store/traceStore';

function formatTraceName(problemId: string): string {
  const traceData = getTraceData(problemId);
  if (traceData?.metadata?.problem) {
    return `${traceData.metadata.problem.number}. ${traceData.metadata.problem.title}`;
  }

  // Fallback to original formatting if no problem metadata
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
    <div className="border-b bg-card h-[10vh]">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Leetcode Debugger
          </h1>
          <div className="flex items-center gap-3">
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
    setProblemsData(problemsJson.problems);

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

      <div className="px-24 w-full p-6 my-auto h-[90vh] overflow-visible">
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