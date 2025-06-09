import { LayoutGroup } from 'framer-motion';
import { useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { useCodeInitialization } from '@/hooks/useCodeInitialization';

import { useTraceStore } from '../store/traceStore';
import CodePanel from './CodePanel';
import ComputationWorkspace from './ComputationWorkspace';
import ExecutionPanel from './ExecutionPanel';
import ResizeHandle from './ResizeHandle';

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
                    // Stacked Layout: Code (top) + Variables (bottom) with resizer
                    <div className="group/stacked h-full">
                        <PanelGroup direction="vertical" className="h-full">
                            {/* Top: Code Panel */}
                            <Panel defaultSize={50} minSize={30}>
                                <div className="h-full overflow-auto">
                                    <CodePanel />
                                </div>
                            </Panel>

                            <ResizeHandle direction="vertical" />

                            {/* Bottom: Execution Panel (Terminal + Variables) */}
                            <Panel defaultSize={50} minSize={30}>
                                <div className="h-full overflow-auto">
                                    <ExecutionPanel isStacked={true} />
                                </div>
                            </Panel>
                        </PanelGroup>
                    </div>
                ) : (
                    // Normal Problem Layout (existing layout for non-lessons)
                    <div className="h-full flex flex-col overflow-visible">
                        <div className="flex-1 overflow-visible">
                            {isOverlayMode ? (
                                // Overlay mode - full-width code with workspace overlay and variable panel
                                <div className="group/overlay h-full">
                                    <PanelGroup direction="horizontal" className="h-full">
                                        <Panel defaultSize={40} minSize={25}>
                                            <div className="h-full overflow-visible">
                                                <CodePanel />
                                            </div>
                                        </Panel>

                                        <ResizeHandle direction="horizontal" />

                                        <Panel defaultSize={60} minSize={25}>
                                            <div className="h-full overflow-visible">
                                                <ExecutionPanel isStacked={false} />
                                            </div>
                                        </Panel>
                                    </PanelGroup>
                                </div>
                            ) : (
                                // Normal mode - side-by-side layout with resizable panels
                                <div className="group/normal h-full">
                                    <PanelGroup direction="horizontal" className="h-full">
                                        {/* Code Panel */}
                                        <Panel defaultSize={50} minSize={30}>
                                            <div className="h-full overflow-visible">
                                                <CodePanel />
                                            </div>
                                        </Panel>

                                        <ResizeHandle direction="horizontal" />

                                        {/* Computation + Variables */}
                                        <Panel defaultSize={50} minSize={30}>
                                            <div className="h-full flex flex-col gap-4 overflow-visible">
                                                <div className="overflow-visible">
                                                    <ComputationWorkspace />
                                                </div>
                                                <div className="flex-1 overflow-visible relative">
                                                    <ExecutionPanel isStacked={false} />
                                                </div>
                                            </div>
                                        </Panel>
                                    </PanelGroup>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </LayoutGroup>
    );
}