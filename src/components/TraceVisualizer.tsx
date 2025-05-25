import React, { useEffect, useState } from 'react';

import { useTraceStore } from '../store/traceStore';
import CodePanel from './CodePanel';
import VariablePanel from './VariablePanel';

import type { TraceData } from '../types/trace';

interface VisualizerProps {
    traceUrl?: string;
    traceData?: TraceData;
    onError?: (error: Error) => void;
}

export default function TraceVisualizer({ traceUrl, traceData: initialData, onError }: VisualizerProps) {
    const { setTraceData, traceData } = useTraceStore();
    const [isLoading, setIsLoading] = useState(false);

    // Initialize trace data
    useEffect(() => {
        if (initialData) {
            setTraceData(initialData);
        } else if (traceUrl) {
            setIsLoading(true);
            fetch(traceUrl)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Failed to load trace: ${res.statusText}`);
                    }
                    return res.json();
                })
                .then((data: TraceData) => {
                    setTraceData(data);
                    setIsLoading(false);
                })
                .catch(error => {
                    setIsLoading(false);
                    if (onError) {
                        onError(error);
                    } else {
                        console.error('Failed to load trace:', error);
                    }
                });
        }
    }, [traceUrl, initialData, setTraceData, onError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!traceData) return null;

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