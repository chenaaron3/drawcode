import React, { useCallback, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { ResizeHandle, TerminalOutput } from '../common';
import PythonTutorVariablePanel from './PythonTutorVariablePanel';

interface ExecutionPanelProps {
    resizeTrigger?: number;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ resizeTrigger: externalResizeTrigger }) => {
    // Internal resize trigger state
    const [internalResizeTrigger, setInternalResizeTrigger] = useState(0);

    // Combine external and internal resize triggers
    const combinedResizeTrigger = (externalResizeTrigger || 0) + internalResizeTrigger;

    // Callback to handle layout changes (when panels are resized)
    const handleLayoutChange = useCallback(() => {
        setInternalResizeTrigger(prev => prev + 1);
    }, []);

    // Always show terminal on top and variables below with terminal taking smaller space
    return (
        <div className="group/execution h-full">
            <PanelGroup direction="vertical" className="h-full" onLayout={handleLayoutChange}>
                <Panel defaultSize={25} minSize={20} maxSize={40}>
                    <TerminalOutput />
                </Panel>

                <ResizeHandle direction="vertical" />

                <Panel defaultSize={75} minSize={60}>
                    <div data-tutorial="variables-panel" className="h-full w-full overflow-y-hidden">
                        <PythonTutorVariablePanel resizeTrigger={combinedResizeTrigger} />
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default ExecutionPanel; 