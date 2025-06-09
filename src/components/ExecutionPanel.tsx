import React from 'react';

import PythonTutorVariablePanel from './PythonTutorVariablePanel';
import TerminalOutput from './TerminalOutput';

interface ExecutionPanelProps {
    resizeTrigger?: number;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ resizeTrigger }) => {
    return (
        <div className="h-full flex flex-col gap-4">
            {/* Terminal Output at the top */}
            <TerminalOutput />

            {/* Variables Panel takes the remaining space */}
            <div className="flex-1">
                <PythonTutorVariablePanel resizeTrigger={resizeTrigger} />
            </div>
        </div>
    );
};

export default ExecutionPanel; 