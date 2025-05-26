import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

import TraceVisualizer from './components/TraceVisualizer';

const AVAILABLE_TRACES = [
  "two-sum.json",
  "remove-duplicates.json",
  "array-intersection-2.json",
  "buy-sell-stocks-2.json",
  "contains-duplicate.json",
  "rotate-array.json",
  "single-number.json",
  "n-queens.json",
] as const;

type TraceFile = typeof AVAILABLE_TRACES[number];

export default function App() {
  const [selectedTrace, setSelectedTrace] = useState<TraceFile>(AVAILABLE_TRACES[0]);
  const [error, setError] = useState<string | null>(null);

  const formatTraceName = (trace: string) => {
    return trace.replace(/-/g, ' ').replace('.json', '').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen overflow-hidden h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Leetcode Debugger</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Select trace:</span>
              <Select
                value={selectedTrace}
                onValueChange={(value) => {
                  setError(null);
                  setSelectedTrace(value as TraceFile);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_TRACES.map(trace => (
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

      {/* Main Content */}
      <div className="mx-auto p-6 my-auto flex flex-1">
        {error ? (
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
        ) : (
          <TraceVisualizer
            traceUrl={`/traces/${selectedTrace}`}
            onError={(err) => setError(err.message)}
          />
        )}
      </div>
    </div>
  );
}