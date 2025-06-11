import { LayoutGroup } from 'framer-motion';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { useTraceStore } from '../../store/traceStore';
import { ResizeHandle } from '../common';
import { CodePanel, ExecutionPanel } from '../panels';

export default function TraceVisualizer() {
    const {
        traceData: currentTraceData
    } = useTraceStore();

    if (!currentTraceData) return null;

    return (
        <LayoutGroup>
            <div className="h-full overflow-visible">
                <div className="group/normal h-full">
                    <PanelGroup direction="horizontal" className="h-full">
                        <Panel defaultSize={50} minSize={25}>
                            <div className="h-full overflow-visible">
                                <CodePanel />
                            </div>
                        </Panel>

                        <ResizeHandle direction="horizontal" />

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