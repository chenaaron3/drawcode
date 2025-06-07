import { LayoutGroup } from 'framer-motion';
import { useEffect } from 'react';

import { getTraceData } from '../data/traces';
import { useTraceStore } from '../store/traceStore';
import CodePanel from './CodePanel';
import ComputationWorkspace from './ComputationWorkspace';
import ComputationWorkspaceOverlay from './ComputationWorkspaceOverlay';
import DraggableVariablePanel from './DraggableVariablePanel';
import PythonTutorVariablePanel from './PythonTutorVariablePanel';

export default function TraceVisualizer() {
    const {
        setTraceData,
        traceData: currentTraceData,
        getCurrentProblemId,
        isOverlayMode,
        toggleOverlayMode
    } = useTraceStore();

    const currentProblemId = getCurrentProblemId();
    const traceData = currentProblemId ? getTraceData(currentProblemId) : null;

    // Initialize trace data when problem changes
    useEffect(() => {
        if (traceData) {
            setTraceData(traceData);
        }
    }, [traceData, setTraceData]);

    // Keyboard shortcut to toggle overlay mode
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'o' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleOverlayMode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleOverlayMode]);

    if (!currentTraceData) return null;

    console.log('TraceVisualizer rendering, isOverlayMode:', isOverlayMode);

    return (
        <LayoutGroup>
            {isOverlayMode ? (
                // Overlay mode - full-width code with draggable variable panel
                <div className="h-full overflow-visible relative">
                    <CodePanel />
                    <ComputationWorkspaceOverlay />
                    <DraggableVariablePanel />
                </div>
            ) : (
                // Normal mode - side-by-side layout
                <div className="flex flex-col lg:flex-row h-full gap-6 overflow-visible">
                    {/* Code Panel */}
                    <div className="order-1 lg:order-1 overflow-visible flex-1">
                        <CodePanel />
                    </div>

                    {/* Computation + Variables */}
                    <div className="order-2 lg:order-2 flex flex-col gap-4 lg:flex-1 overflow-visible">
                        <div className="overflow-visible">
                            <ComputationWorkspace />
                        </div>
                        <div className="flex-1 overflow-visible relative">
                            <PythonTutorVariablePanel />
                        </div>
                    </div>
                </div>
            )}
        </LayoutGroup>
    );
}