import React, { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            <Card>
                <CardContent className="flex items-center justify-center min-h-[200px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Loading trace data...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!traceData) return null;

    const formatFunctionName = (name: string) => {
        return name
            .split(/(?=[A-Z])|_/)
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <div className="space-y-2">
            {/* Code and Variables - Optimized for variables space */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 min-h-[calc(100vh-160px)]">
                <CodePanel />
                <VariablePanel />
            </div>
        </div>
    );
}