import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

import TraceVisualizer from './components/TraceVisualizer';
import { AVAILABLE_TRACE_FILES, getTraceData } from './data/traces';

type TraceFile = string;

function formatTraceName(trace: string): string {
  return trace
    .replace(/-/g, ' ')
    .replace('.json', '')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

interface HeaderProps {
  selectedTrace: TraceFile;
  onTraceChange: (trace: TraceFile) => void;
}

function Header({ selectedTrace, onTraceChange }: HeaderProps) {
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
                {AVAILABLE_TRACE_FILES.map(trace => (
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