import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';

import { useCurrentStep } from '../hooks/useCurrentStep';
import { selectCurrentLine, useTraceStore } from '../store/traceStore';
import { ErrorPanel } from './ErrorPanel';
import { InputsSection } from './InputsSection';
import { TraceControls } from './TraceControls';

export default function CodePanel() {
    const {
        traceData,
        isPlaying,
        playSpeed,
        setIsPlaying,
        next,
        setInputOverride,
        getInputOverrides,
        currentCode,
        setCurrentCode,
        hasChanges,
        currentError,
        clearError,
    } = useTraceStore();
    const currentLine = useTraceStore(selectCurrentLine);
    const currentStep = useCurrentStep();
    const [isReadOnly, setIsReadOnly] = useState(true);

    // Handle input changes
    const handleInputChange = (key: string, value: any) => {
        console.log('handleInputChange', key, value);
        setInputOverride(key, value);
        // Clear validation error when user changes the input
        if (currentError?.type === 'validation' && currentError?.invalidField === key) {
            clearError();
        }
    };

    // Get current input values (overrides or defaults)
    const getCurrentInputs = () => {
        if (!traceData) return {};
        const overrides = getInputOverrides();
        return { ...traceData.metadata.inputs.kwargs, ...overrides };
    };

    // Handle clicking outside editor to exit edit mode
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            // Check if click is outside the Monaco editor
            if (isReadOnly === false && !target.closest('.monaco-editor')) {
                setIsReadOnly(true);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isReadOnly]);

    // Exit edit mode when changes are reset or trace is updated
    useEffect(() => {
        if (!hasChanges) {
            setIsReadOnly(true);
        }
    }, [hasChanges]);

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
    }, [isPlaying, playSpeed, traceData, next]);

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

    return (
        <>
            <TooltipProvider>
                <Card className="h-full flex-1/3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                                {traceData.metadata.problem?.title ?? "Code"}
                            </CardTitle>
                        </div>

                        {/* Integrated Controls */}
                        <TraceControls />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        {/* Error Panel */}
                        <ErrorPanel error={currentError} />

                        {/* Inputs Section */}
                        {traceData && (
                            <InputsSection
                                inputs={getCurrentInputs()}
                                onInputChange={handleInputChange}
                                validationError={currentError}
                            />
                        )}

                        <div className="rounded-md overflow-hidden bg-muted/30 h-full relative">
                            {isReadOnly ? (
                                <>
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
                                            cursor: 'text',
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
                                                    cursor: 'text',
                                                },
                                                'data-line-number': lineNumber,
                                                'data-is-current': isCurrentLine,
                                                onClick: () => {
                                                    setIsReadOnly(false);
                                                    setIsPlaying(false); // Pause debugger when entering edit mode
                                                },
                                            };
                                        }}
                                    >
                                        {currentCode || ''}
                                    </SyntaxHighlighter>

                                    {/* Edit Button Overlay */}
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setIsReadOnly(false);
                                            setIsPlaying(false);
                                        }}
                                        className="absolute top-1 right-1 z-10 shadow-sm"
                                    >
                                        Edit
                                    </Button>
                                </>
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
                        </div>
                    </CardContent>
                </Card>
            </TooltipProvider>
        </>
    );
} 