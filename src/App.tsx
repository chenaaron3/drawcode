import { useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

import problemsJson from '../public/problems.json';
import TraceVisualizer from './components/TraceVisualizer';
import { AVAILABLE_PROBLEM_IDS, getTraceData } from './data/traces';
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
    setCurrentProblem
  } = useTraceStore();

  const currentProblemId = getCurrentProblemId();

  // Load problems data and set initial problem on mount
  useEffect(() => {
    setProblemsData(problemsJson.problems);
    if (!currentProblemId) {
      setCurrentProblem('two-sum');
    }
  }, [setProblemsData, setCurrentProblem, currentProblemId]);

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
    </div>
  );
}