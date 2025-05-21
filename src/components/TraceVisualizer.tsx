import React, { useEffect } from 'react';

import { useTraceStore } from '../store/traceStore';
import CodePanel from './CodePanel';
import VariablePanel from './VariablePanel';

import type { TraceData } from '../types/trace';

interface VisualizerProps {
    traceUrl?: string;
    traceData?: TraceData;
}

export default function TraceVisualizer({ traceUrl, traceData: initialData }: VisualizerProps) {
    const { setTraceData, traceData } = useTraceStore();

    // Initialize trace data
    useEffect(() => {
        if (initialData) {
            setTraceData(initialData);
        } else if (traceUrl) {
            fetch(traceUrl)
                .then(res => res.json())
                .then((data: TraceData) => setTraceData(data))
                .catch(console.error);
        }
    }, [traceUrl, initialData, setTraceData]);

    if (!traceData) return <p>Loading trace...</p>;

    return (
        <div className="container mx-auto">
            {/* Title */}
            <h1 className="text-3xl font-bold text-center py-8">
                {traceData.metadata.function
                    .split(/(?=[A-Z])|_/)
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')}
            </h1>
            {/* Main content */}
            <div className="flex flex-row gap-8 mx-auto px-8">
                <CodePanel />
                <VariablePanel />
            </div>
        </div>
    );
}