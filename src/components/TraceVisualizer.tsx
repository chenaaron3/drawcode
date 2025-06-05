import { LayoutGroup } from 'framer-motion';
import { useEffect } from 'react';

import { getTraceData } from '../data/traces';
import { useTraceStore } from '../store/traceStore';
import CodePanel from './CodePanel';
import ComputationWorkspace from './ComputationWorkspace';
import PythonTutorVariablePanel from './PythonTutorVariablePanel';

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
            <div className="flex flex-col lg:flex-row h-full gap-6 overflow-visible">
                {/* Code Panel - order 3 on mobile, order 1 on desktop */}
                <div className="order-1 lg:order-1 flex-1 overflow-visible">
                    <CodePanel />
                </div>

                {/* Computation + Variables - order 1-2 on mobile, order 2 on desktop */}
                <div className="order-2 lg:order-2 flex flex-col gap-4 lg:flex-1 overflow-visible">
                    <div className="overflow-visible">
                        <ComputationWorkspace />
                    </div>
                    <div className="flex-1 overflow-visible relative">
                        {/* Variable Panel Content */}
                        <PythonTutorVariablePanel />
                    </div>
                </div>
            </div>
        </LayoutGroup>
    );
}