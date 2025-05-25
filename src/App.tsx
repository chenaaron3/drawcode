import { useState } from 'react';

import TraceVisualizer from './components/TraceVisualizer';

const AVAILABLE_TRACES = [
  "two-sum.json",
  "remove-duplicates.json",
  "array-intersection-2.json",
  "buy-sell-stocks-2.json",
  "contains-duplicate.json",
  "rotate-array.json",
  "single-number.json"
] as const;

type TraceFile = typeof AVAILABLE_TRACES[number];

export default function App() {
  const [selectedTrace, setSelectedTrace] = useState<TraceFile>(AVAILABLE_TRACES[0]);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="p-4">
      <select
        value={selectedTrace}
        onChange={(e) => {
          setError(null);
          setSelectedTrace(e.target.value as TraceFile);
        }}
        className="mb-4 p-2 rounded border border-gray-300"
      >
        {AVAILABLE_TRACES.map(trace => (
          <option key={trace} value={trace}>
            {trace.replace(/-/g, ' ').replace('.json', '')}
          </option>
        ))}
      </select>

      {error ? (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      ) : (
        <TraceVisualizer
          traceUrl={`/traces/${selectedTrace}`}
          onError={(err) => setError(err.message)}
        />
      )}
    </div>
  );
}