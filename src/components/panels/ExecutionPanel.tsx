import React, { useCallback, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { useTerminalOutput } from '../../hooks/useTerminalOutput';
import { ResizeHandle, TerminalOutput } from '../common';
import PythonTutorVariablePanel from './PythonTutorVariablePanel';

interface ExecutionPanelProps {
    resizeTrigger?: number;
    isStacked?: boolean;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ resizeTrigger: externalResizeTrigger, isStacked = false }) => {
    // Use the custom hook to get terminal output information
    const { hasTerminalOutput } = useTerminalOutput();

    // Internal resize trigger state
    const [internalResizeTrigger, setInternalResizeTrigger] = useState(0);

    // Combine external and internal resize triggers
    const combinedResizeTrigger = (externalResizeTrigger || 0) + internalResizeTrigger;

    // Callback to handle layout changes (when panels are resized)
    const handleLayoutChange = useCallback(() => {
        setInternalResizeTrigger(prev => prev + 1);
    }, []);

    if (isStacked && hasTerminalOutput) {
        // Stacked mode: Terminal and Variables side by side with resizer
        return (
            <div className="group/execution h-full">
                <PanelGroup direction="horizontal" className="h-full" onLayout={handleLayoutChange}>
                    <Panel defaultSize={40} minSize={25}>
                        <TerminalOutput isStacked={isStacked} />
                    </Panel>

                    <ResizeHandle direction="horizontal" />

                    <Panel defaultSize={60} minSize={25}>
                        <div data-tutorial="variables-panel" className="h-full w-full">
                            <PythonTutorVariablePanel resizeTrigger={combinedResizeTrigger} />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        );
    }

    if (isStacked && !hasTerminalOutput) {
        // Stacked mode but no terminal output: Just show variables
        return (
            <div className="h-full" data-tutorial="variables-panel">
                <PythonTutorVariablePanel resizeTrigger={combinedResizeTrigger} />
            </div>
        );
    }

    // Normal mode: Terminal on top (if exists), Variables below with resizable panels
    if (hasTerminalOutput) {
        return (
            <div className="group/execution h-full">
                <PanelGroup direction="vertical" className="h-full" onLayout={handleLayoutChange}>
                    <Panel defaultSize={30} minSize={20}>
                        <TerminalOutput isStacked={isStacked} />
                    </Panel>

                    <ResizeHandle direction="vertical" />

                    <Panel defaultSize={70} minSize={30}>
                        <div data-tutorial="variables-panel">
                            <PythonTutorVariablePanel resizeTrigger={combinedResizeTrigger} />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        );
    }

    // Normal mode but no terminal output: Just show variables
    return (
        <div className="h-full" data-tutorial="variables-panel">
            <PythonTutorVariablePanel resizeTrigger={combinedResizeTrigger} />
        </div>
    );
};

export default ExecutionPanel; 