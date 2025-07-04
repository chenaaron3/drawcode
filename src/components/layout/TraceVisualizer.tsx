import { LayoutGroup } from 'framer-motion';
import { useCallback, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { ResizeHandle, TerminalOutput } from '../common';
import { CodePanel, PythonTutorVariablePanel } from '../panels';

interface TraceVisualizerProps {
    stacked?: boolean;
}

export default function TraceVisualizer({ stacked = false }: TraceVisualizerProps) {
    // Internal resize trigger state
    const [internalResizeTrigger, setInternalResizeTrigger] = useState(0);

    // Callback to handle layout changes (when panels are resized)
    const handleLayoutChange = useCallback(() => {
        setInternalResizeTrigger(prev => prev + 1);
    }, []);

    if (stacked) {
        return (
            <LayoutGroup>
                <div className="h-full overflow-visible">
                    <div className="group/normal h-full">
                        <PanelGroup direction="vertical" className="h-full" onLayout={handleLayoutChange}>
                            <Panel defaultSize={10} minSize={10} maxSize={40}>
                                <div className="h-full">
                                    <TerminalOutput />
                                </div>
                            </Panel>
                            <ResizeHandle direction="vertical" />
                            <Panel defaultSize={50} minSize={25}>
                                <div className="h-full overflow-visible">
                                    <CodePanel />
                                </div>
                            </Panel>
                            <ResizeHandle direction="vertical" />
                            <Panel defaultSize={35} minSize={25}>
                                <div data-tutorial="variables-panel" className="h-full w-full overflow-y-hidden">
                                    <PythonTutorVariablePanel resizeTrigger={internalResizeTrigger} />
                                </div>
                            </Panel>
                        </PanelGroup>
                    </div>
                </div>
            </LayoutGroup>
        );
    } else {
        return <LayoutGroup>
            <div className="h-full overflow-visible">
                <div className="group/normal h-full">
                    <PanelGroup direction="horizontal" className="h-full" onLayout={handleLayoutChange}>
                        <Panel defaultSize={50} minSize={25}>
                            <div className="h-full overflow-visible">
                                <CodePanel />
                            </div>
                        </Panel>
                        <ResizeHandle direction="horizontal" />
                        <Panel defaultSize={50} minSize={25}>
                            <PanelGroup direction="vertical" className="h-full" onLayout={handleLayoutChange}>
                                <Panel defaultSize={20} minSize={20} maxSize={40}>
                                    <TerminalOutput />
                                </Panel>
                                <ResizeHandle direction="vertical" />
                                <Panel defaultSize={80} minSize={60}>
                                    <div data-tutorial="variables-panel" className="h-full w-full overflow-y-hidden">
                                        <PythonTutorVariablePanel resizeTrigger={internalResizeTrigger} />
                                    </div>
                                </Panel>
                            </PanelGroup>
                        </Panel>
                    </PanelGroup>
                </div>
            </div>
        </LayoutGroup>
    }
}