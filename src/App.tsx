import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

import TraceVisualizer from './components/TraceVisualizer';
import { AVAILABLE_TRACE_FILES, getTraceData } from './data/traces';

type TraceFile = string;

function formatTraceName(trace: string): string {
  const traceData = getTraceData(trace);
  if (traceData?.metadata?.problem) {
    return `${traceData.metadata.problem.number}. ${traceData.metadata.problem.title}`;
  }

  // Fallback to original formatting if no problem metadata
  return trace
    .replace(/-/g, ' ')
    .replace('.json', '')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function getSortedTraceFiles(): string[] {
  return AVAILABLE_TRACE_FILES.sort((a, b) => {
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
  selectedTrace: TraceFile;
  onTraceChange: (trace: TraceFile) => void;
}

function Header({ selectedTrace, onTraceChange }: HeaderProps) {
  const sortedTraceFiles = getSortedTraceFiles();

  return (
    <div className="border-b bg-card h-[10vh]">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Leetcode Debugger
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Select trace:
            </span>
            <Select value={selectedTrace} onValueChange={onTraceChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortedTraceFiles.map(trace => (
                  <SelectItem key={trace} value={trace}>
                    {formatTraceName(trace)}
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
  const [selectedTrace, setSelectedTrace] = useState<TraceFile>(AVAILABLE_TRACE_FILES[0]);

  const handleTraceChange = (trace: string) => {
    setSelectedTrace(trace as TraceFile);
  };

  // Get the trace data for the selected trace
  const traceData = getTraceData(selectedTrace);

  return (
    <div className="min-h-screen overflow-visible h-screen bg-background flex flex-col">
      <Header
        selectedTrace={selectedTrace}
        onTraceChange={handleTraceChange}
      />

      <div className="px-24 w-full p-6 my-auto h-[90vh] overflow-visible">
        {traceData ? (
          <TraceVisualizer
            traceData={traceData}
          />
        ) : (
          <ErrorDisplay error={`Trace file "${selectedTrace}" not found`} />
        )}
      </div>
    </div>
  );
}