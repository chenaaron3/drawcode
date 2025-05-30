import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';

import { useCurrentStep } from '../hooks/useCurrentStep';
import { usePyodide } from '../hooks/usePyodide';
import { selectCurrentLine, useTraceStore } from '../store/traceStore';
import InputPopover from './InputPopover';
import { InputsSection } from './InputsSection';
import { TraceControls } from './TraceControls';

export default function CodePanel() {
    const {
        traceData,
        lineIndex,
        isPlaying,
        playSpeed,
        setIsPlaying,
        next,
        getCurrentProblemId,
        getCurrentProblemData,
        setInputOverride,
        getInputOverrides,
        currentCode,
        setCurrentCode,
        hasChanges,
        resetToOriginal,
        setTraceData
    } = useTraceStore();
    const currentLine = useTraceStore(selectCurrentLine);
    const currentStep = useCurrentStep();
    const [isInputPopoverOpen, setIsInputPopoverOpen] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { generateTrace } = usePyodide();
    const currentProblemId = getCurrentProblemId();
    const problemData = currentProblemId ? getCurrentProblemData(currentProblemId) : null;

    // Handle input changes
    const handleInputChange = (key: string, value: any) => {
        setInputOverride(key, value);
    };

    // Handle reset to original
    const handleReset = () => {
        resetToOriginal();
        setError(null);
    };

    // Handle update (generate new trace)
    const handleUpdate = async () => {
        if (!problemData || !currentCode) return;

        setIsGenerating(true);
        setError(null);

        try {
            const currentInputs = { ...traceData?.metadata.inputs.kwargs, ...getInputOverrides() };
            const newTraceData = await generateTrace(currentCode, problemData.entrypoint, currentInputs);

            if (newTraceData.error) {
                setError(newTraceData.error);
            } else {
                setTraceData(newTraceData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate trace');
        } finally {
            setIsGenerating(false);
        }
    };

    // Get current input values (overrides or defaults)
    const getCurrentInputs = () => {
        if (!traceData) return {};
        const overrides = getInputOverrides();
        return { ...traceData.metadata.inputs.kwargs, ...overrides };
    };

    // Handle auto-play
    useEffect(() => {
        let intervalId: number | null = null;

        if (isPlaying && traceData) {
            intervalId = window.setInterval(() => {
                next();
            }, playSpeed);
        }

        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [isPlaying, playSpeed, traceData, lineIndex, setIsPlaying, next]);

    if (!traceData || !currentLine || !currentStep) {
        return (
            <Card className={cn('flex flex-col')}>
                <CardHeader>
                    <CardTitle>Code</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
                    No trace data loaded
                </CardContent>
            </Card>
        );
    }

    const formatFunctionName = (name: string) => {
        return name
            .split(/(?=[A-Z])|_/)
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <>
            <TooltipProvider>
                <Card className="h-full flex-1/3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                                {formatFunctionName(traceData.metadata.function)}
                            </CardTitle>
                        </div>

                        {/* Integrated Controls */}
                        <TraceControls />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        {/* Inputs Section */}
                        {traceData && (
                            <InputsSection
                                inputs={getCurrentInputs()}
                                onInputChange={handleInputChange}
                            />
                        )}

                        {/* Change Detection Buttons */}
                        {hasChanges && (
                            <div className="border-b bg-yellow-50 border-yellow-200 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm text-yellow-800 font-medium">
                                        You have unsaved changes
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReset}
                                        disabled={isGenerating}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleUpdate}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? 'Updating...' : 'Update'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="border-b bg-red-50 border-red-200 px-4 py-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="rounded-md overflow-hidden bg-muted/30 h-full relative">
                            {isReadOnly ? (
                                <SyntaxHighlighter
                                    language="python"
                                    style={oneLight}
                                    customStyle={{
                                        margin: 0,
                                        padding: 0,
                                        background: 'transparent',
                                        fontSize: '0.75rem',
                                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                        height: 'calc(100vh - 320px)',
                                        overflow: 'auto',
                                        lineHeight: '1.3',
                                    }}
                                    showLineNumbers={true}
                                    lineNumberStyle={{
                                        minWidth: '2rem',
                                        paddingRight: '0.75rem',
                                        color: '#6b7280',
                                        fontSize: '0.7rem',
                                        textAlign: 'right',
                                        userSelect: 'none',
                                    }}
                                    wrapLines={true}
                                    lineProps={(lineNumber) => {
                                        const isCurrentLine = currentLine?.line_number === lineNumber;
                                        return {
                                            style: {
                                                display: 'block',
                                                backgroundColor: isCurrentLine ? 'rgb(219 234 254)' : 'transparent',
                                                borderLeft: isCurrentLine ? '3px solid rgb(59 130 246)' : '3px solid transparent',
                                                fontWeight: isCurrentLine ? '500' : 'normal',
                                                padding: '0.25rem 0.75rem',
                                                transition: 'all 0.2s ease',
                                                lineHeight: '1.3',
                                            },
                                            'data-line-number': lineNumber,
                                            'data-is-current': isCurrentLine
                                        };
                                    }}
                                >
                                    {currentCode || ''}
                                </SyntaxHighlighter>
                            ) : (
                                <Editor
                                    height="calc(100vh - 320px)"
                                    language="python"
                                    value={currentCode || ''}
                                    onChange={(value) => setCurrentCode(value || '')}
                                    options={{
                                        fontSize: 12,
                                        lineHeight: 1.8,
                                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        lineNumbers: 'on',
                                        lineNumbersMinChars: 5,
                                        glyphMargin: false,
                                        folding: false,
                                        lineDecorationsWidth: 12,
                                        renderLineHighlight: 'none',
                                        hideCursorInOverviewRuler: true,
                                        overviewRulerBorder: false,
                                        scrollbar: {
                                            vertical: 'auto',
                                            horizontal: 'auto',
                                            verticalScrollbarSize: 14,
                                            horizontalScrollbarSize: 14,
                                        },
                                        padding: {
                                            top: 4,
                                            bottom: 4,
                                        },
                                    }}
                                />
                            )}

                            {/* Read-Only Toggle */}
                            <Button
                                variant="secondary"
                                size="sm"
                                className="absolute top-2 right-2 opacity-70 hover:opacity-100"
                                onClick={() => setIsReadOnly(!isReadOnly)}
                            >
                                {isReadOnly ? 'Edit' : 'View'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TooltipProvider>

            {/* Input Popover */}
            {problemData && (
                <InputPopover
                    problemData={problemData}
                    isOpen={isInputPopoverOpen}
                    onClose={() => setIsInputPopoverOpen(false)}
                />
            )}
        </>
    );
} 