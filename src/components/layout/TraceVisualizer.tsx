import { LayoutGroup } from 'framer-motion';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { ResizeHandle } from '../common';
import { CodePanel, ExecutionPanel } from '../panels';

interface TraceVisualizerProps {
    stacked?: boolean;
}

export default function TraceVisualizer({ stacked = false }: TraceVisualizerProps) {
    const direction = stacked ? 'vertical' : 'horizontal';
    return (
        <LayoutGroup>
            <div className="h-full overflow-visible">
                <div className="group/normal h-full">
                    <PanelGroup direction={direction} className="h-full">
                        <Panel defaultSize={50} minSize={25}>
                            <div className="h-full overflow-visible">
                                <CodePanel />
                            </div>
                        </Panel>

                        <ResizeHandle direction={direction} />

                        <Panel defaultSize={50} minSize={25}>
                            <div className="h-full overflow-visible">
                                <ExecutionPanel />
                            </div>
                        </Panel>
                    </PanelGroup>
                </div>
            </div>
        </LayoutGroup>
    );
}