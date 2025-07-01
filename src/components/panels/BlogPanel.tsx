import { Navigation, Settings, TerminalIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { useTerminalOutput } from '@/hooks/useTerminalOutput';
import { selectCurrentLine, useTraceStore } from '@/store/traceStore';

import { CodeSyntaxHighlighter } from '../common/CodeSyntaxHighlighter';
import TerminalOutput, { TerminalOutputContent } from '../common/TerminalOutput';
import { NavigationControls, SettingControls } from '../controls';
import { PythonTutorVariablePanelInner } from './PythonTutorVariablePanel';

export default function BlogCodePanel() {
    const traceData = useTraceStore(state => state.traceData);
    const currentLine = useTraceStore(selectCurrentLine);
    const stepIndex = useTraceStore(state => state.stepIndex);

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
        <div className="flex flex-col h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-900">
                <div className="max-h-64  flex items-center justify-between gap-4">
                    <TerminalOutputContent />
                    <div className='flex gap-2'>
                        <NavigationControls />
                        <SettingControls />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-[300px] flex flex-col">
                {/* Code Panel */}
                <div className="flex-1 py-3 min-h-0 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100/50 dark:border-slate-700/50">
                    <CodeSyntaxHighlighter
                        code={traceData.metadata.code}
                        currentLine={currentLine?.line_number}
                        showOverlay={true}
                    />
                </div>
                {/* Variable Panel */}
                <div className=" flex-1 min-h-0 bg-white/50 dark:bg-slate-900/50">
                    <ReactFlowProvider>
                        <PythonTutorVariablePanelInner resizeTrigger={stepIndex} />
                    </ReactFlowProvider>
                </div>
            </div>
        </div>
    );
} 