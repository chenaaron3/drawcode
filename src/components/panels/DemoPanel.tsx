import { TerminalIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { useTerminalOutput } from '@/hooks/useTerminalOutput';
import { selectCurrentLine, useTraceStore } from '@/store/traceStore';

import { CodeSyntaxHighlighter } from '../common/CodeSyntaxHighlighter';
import { NavigationControls } from '../controls';
import { PythonTutorVariablePanelInner } from './PythonTutorVariablePanel';

export default function DemoPanel() {
    const traceData = useTraceStore(state => state.traceData);
    const currentLine = useTraceStore(selectCurrentLine);
    const stepIndex = useTraceStore(state => state.stepIndex);
    const { terminalOutput } = useTerminalOutput();
    const [lastOutputLength, setLastOutputLength] = React.useState(0);

    // Show toast for new terminal output
    useEffect(() => {
        if (terminalOutput.length > lastOutputLength) {
            // Only show toast for the new output
            const newOutput = terminalOutput[terminalOutput.length - 1];
            if (newOutput) {
                toast.info(`Line ${newOutput.line}: ${newOutput.output}`, {
                    position: 'top-center',
                    duration: 3000,
                    className: 'font-mono text-sm',
                    icon: <TerminalIcon className="w-4 h-4" />,
                });
            }
            setLastOutputLength(terminalOutput.length);
        }
    }, [terminalOutput, lastOutputLength]);

    if (!traceData) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No trace data loaded</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Word Guessing Game</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Find the secret word by guessing from a list</p>
                    </div>
                    <div className="flex flex-col gap-1 justify-center items-center">
                        <div className="text-xs font-medium animate-color-cycle bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-ping">Try it out</div>
                        <div className="flex items-center gap-2">
                            <NavigationControls />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-[300px] flex flex-col">
                {/* Code Panel */}
                <div className="py-3 flex-1 min-h-0 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100/50 dark:border-slate-700/50">
                    <CodeSyntaxHighlighter
                        code={traceData.metadata.code}
                        currentLine={currentLine?.line_number}
                        showOverlay={true}
                    />
                </div>

                {/* Variable Panel */}
                <div className="h-[250px] min-h-0 bg-white/50 dark:bg-slate-900/50">
                    <ReactFlowProvider>
                        <PythonTutorVariablePanelInner resizeTrigger={stepIndex} />
                    </ReactFlowProvider>
                </div>
            </div>
        </div>
    );
} 