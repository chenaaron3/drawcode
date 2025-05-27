import { LayoutGroup } from 'framer-motion';
import { useEffect } from 'react';

import { useTraceStore } from '../store/traceStore';
import CodePanel from './CodePanel';
import ComputationWorkspace from './ComputationWorkspace';
import VariablePanel from './VariablePanel';

import type { TraceData } from '../types/trace';

interface VisualizerProps {
    traceData: TraceData;
    onError?: (error: Error) => void;
}

export default function TraceVisualizer({ traceData, onError }: VisualizerProps) {
    const { setTraceData, traceData: currentTraceData } = useTraceStore();

    // Initialize trace data
    useEffect(() => {
        setTraceData(traceData);
    }, [traceData, setTraceData]);

    if (!currentTraceData) return null;

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