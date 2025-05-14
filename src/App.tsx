import TraceVisualizer from './components/TraceVisualizer';

export default function App() {
  return (
    <div className="p-4">
      <TraceVisualizer traceUrl="/trace.json" />
    </div>
  );
}