import { LayoutGroup } from 'framer-motion';
import { useEffect } from 'react';

import { useCodeInitialization } from '@/hooks/useCodeInitialization';

import { useTraceStore } from '../store/traceStore';
import CodePanel from './CodePanel';
import ComputationWorkspace from './ComputationWorkspace';
import ExecutionPanel from './ExecutionPanel';

interface TraceVisualizerProps {
    // Layout control
    isStacked?: boolean;
}

export default function TraceVisualizer({
    isStacked = false
}: TraceVisualizerProps) {
    const {
        traceData: currentTraceData,
        isOverlayMode,
        toggleOverlayMode
    } = useTraceStore();

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

    const { isInitializing } = useCodeInitialization();

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Initializing...</p>
                </div>
            </div>
        );
    }

    if (!currentTraceData) return null;

    return (
        <LayoutGroup>
            <div className="h-full overflow-visible">
                {isStacked ? (
                    // Stacked Layout: Code (top) + Variables (bottom)
                    <div className="h-full flex flex-col gap-4 overflow-visible">
                        {/* Top: Code Panel */}
                        <div className="h-1/2 overflow-auto">
                            <CodePanel />
                        </div>

                        {/* Bottom: Execution Panel (Terminal + Variables) */}
                        <div className="h-1/2 overflow-auto">
                            <ExecutionPanel />
                        </div>
                    </div>
                ) : (
                    // Normal Problem Layout (existing layout for non-lessons)
                    <div className="h-full flex flex-col overflow-visible">
                        <div className="flex-1 overflow-visible">
                            {isOverlayMode ? (
                                // Overlay mode - full-width code with workspace overlay and variable panel
                                <div className="h-full overflow-visible relative flex gap-4">
                                    <div className="flex-1">
                                        <CodePanel />
                                    </div>
                                    <div className="w-3/5">
                                        <ExecutionPanel />
                                    </div>
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
                                            <ExecutionPanel />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </LayoutGroup>
    );
}