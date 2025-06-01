import { LayoutGroup } from 'framer-motion';
import { useEffect } from 'react';

import { getTraceData } from '../data/traces';
import { useTraceStore } from '../store/traceStore';
import CodePanel from './CodePanel';
import ComputationWorkspace from './ComputationWorkspace';
import { ProblemDescription } from './ProblemDescription';
import VariablePanel from './VariablePanel';

export default function TraceVisualizer() {
    const {
        setTraceData,
        traceData: currentTraceData,
        getCurrentProblemId
    } = useTraceStore();

    const currentProblemId = getCurrentProblemId();
    const traceData = currentProblemId ? getTraceData(currentProblemId) : null;

    // Initialize trace data when problem changes
    useEffect(() => {
        if (traceData) {
            setTraceData(traceData);
        }
    }, [traceData, setTraceData]);

    if (!currentTraceData) return null;

    return (
        <LayoutGroup>
            <div className="flex h-full gap-6 overflow-visible">
                <div className="flex-1 flex flex-col gap-4 overflow-visible">
                    {/* Problem Description */}
                    {currentProblemId && (
                        <ProblemDescription problemId={currentProblemId} />
                    )}

                    {/* Code Panel */}
                    <div className="flex-1 overflow-visible">
                        <CodePanel />
                    </div>
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