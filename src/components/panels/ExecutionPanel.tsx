import React from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { useTerminalOutput } from '../../hooks/useTerminalOutput';
import { ResizeHandle, TerminalOutput } from '../common';
import PythonTutorVariablePanel from './PythonTutorVariablePanel';

interface ExecutionPanelProps {
    resizeTrigger?: number;
    isStacked?: boolean;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ resizeTrigger, isStacked = false }) => {
    // Use the custom hook to get terminal output information
    const { hasTerminalOutput } = useTerminalOutput();

    if (isStacked && hasTerminalOutput) {
        // Stacked mode: Terminal and Variables side by side with resizer
        return (
            <div className="group/execution h-full">
                <PanelGroup direction="horizontal" className="h-full">
                    <Panel defaultSize={40} minSize={25}>
                        <TerminalOutput />
                    </Panel>

                    <ResizeHandle direction="horizontal" />

                    <Panel defaultSize={60} minSize={25}>
                        <PythonTutorVariablePanel resizeTrigger={resizeTrigger} />
                    </Panel>
                </PanelGroup>
            </div>
        );
    }

    if (isStacked && !hasTerminalOutput) {
        // Stacked mode but no terminal output: Just show variables
        return (
            <div className="h-full">
                <PythonTutorVariablePanel resizeTrigger={resizeTrigger} />
            </div>
        );
    }

    // Normal mode: Terminal on top (if exists), Variables below
    return (
        <div className="h-full flex flex-col gap-4">
            {hasTerminalOutput && <TerminalOutput />}
            <div className="flex-1">
                <PythonTutorVariablePanel resizeTrigger={resizeTrigger} />
            </div>
        </div>
    );
};

export default ExecutionPanel; 