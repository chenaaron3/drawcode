import { LayoutGroup } from 'framer-motion';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { useTraceStore } from '../../store/traceStore';
import { ResizeHandle } from '../common';
import { CodePanel, ExecutionPanel } from '../panels';

interface TraceVisualizerProps {
    // Layout control
    isStacked?: boolean;
}

export default function TraceVisualizer({
    isStacked = false
}: TraceVisualizerProps) {
    const {
        traceData: currentTraceData
    } = useTraceStore();

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
                    // Non-stacked Layout: Code panel + Execution panel with adjustable panels
                    <div className="group/normal h-full">
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
                )}
            </div>
        </LayoutGroup>
    );
}