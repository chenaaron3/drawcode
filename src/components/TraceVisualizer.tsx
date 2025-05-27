import { LayoutGroup } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';

import { getTraceData } from '../data/traces';
import { useTraceStore } from '../store/traceStore';
import CodePanel from './CodePanel';
import ComputationWorkspace from './ComputationWorkspace';
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
            // Extract filename from URL (e.g., "/traces/two-sum.json" -> "two-sum.json")
            const filename = traceUrl.split('/').pop() || '';
            const prebundledData = getTraceData(filename);

            if (prebundledData) {
                // Use prebundled data
                setTraceData(prebundledData);
            } else {
                // Fallback to fetching if not prebundled
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

    return (
        <LayoutGroup>
            <div className="flex h-full gap-6 overflow-visible">
                <div className="flex-1 overflow-visible">
                    <CodePanel />
                </div>
                <div className="flex-1 flex flex-col gap-4 overflow-visible">
                    <div className="overflow-visible">
                        <ComputationWorkspace />
                    </div>
                    <div className="flex-1 overflow-visible">
                        <VariablePanel />
                    </div>
                </div>
            </div>
        </LayoutGroup>
    );
}