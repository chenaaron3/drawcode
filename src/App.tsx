import { useState } from 'react';

import TraceVisualizer from './components/TraceVisualizer';

export default function App() {
  const traces = [
    "two-sum.json",
    "remove-duplicates.json",
    "array-intersection-2.json",
    "buy-sell-stocks-2.json",
    "contains-duplicate.json",
    "rotate-array.json",
    "single-number.json"
  ]
  const [selectedTrace, setSelectedTrace] = useState(traces[0]);
  return (
    <div className="p-4">
      <select onChange={(e) => setSelectedTrace(e.target.value)}>
        {traces.map(x => <option value={x}>{x}</option>)}
      </select>
      <TraceVisualizer traceUrl={`/traces/${selectedTrace}`} />
    </div>
  );
}