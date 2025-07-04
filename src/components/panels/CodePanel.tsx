import { Braces, Code, FileCode, Pencil, Terminal } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';

import { selectCurrentLine, useTraceStore } from '../../store/traceStore';
import { InputsSection } from '../common';
import { CodeSyntaxHighlighter } from '../common/CodeSyntaxHighlighter';
import { NavigationControls, SettingControls } from '../controls';
import { ProblemDescriptionModal } from '../modals';
import { ComputationWorkspaceOverlay } from '../overlays';
import { ErrorPanel } from './ErrorPanel';

// Type for Monaco editor mouse target
type EditorMouseTarget = {
    position?: { lineNumber: number; column: number } | null;
    element?: HTMLElement | null;
    mouseColumn?: number;
};

export default function CodePanel() {
    const {
        traceData,
        setIsPlaying,
        setInputOverride,
        getInputOverrides,
        currentCode,
        setCurrentCode,
        hasChanges,
        currentError,
        clearError,
        getCurrentProblemId,
        getCurrentProblemData,
    } = useTraceStore();
    const router = useRouter();
    const currentLine = useTraceStore(selectCurrentLine);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const problemId = getCurrentProblemId();
    const problemData = problemId ? getCurrentProblemData(problemId) : null;
    const lastMouseClickRef = useRef<{ x: number; y: number } | null>(null);

    // Handle input changes
    const handleInputChange = (key: string, value: any) => {
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

    if (!traceData) {
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
                <Card className="h-full flex flex-col gap-2" data-tutorial="code-panel">
                    <CardHeader className="relative flex-col flex lg:flex-row items-center justify-between space-y-0 lg:pb-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <CardTitle className="hidden lg:visible text-md lg:flex gap-2 items-center">
                                <Code className="w-4 h-4" />
                                {router.pathname === "/lesson" ? "Program" : (problemData?.title ?? "Program")}
                            </CardTitle>
                            {problemId && problemData?.details && (
                                <ProblemDescriptionModal problemId={problemId} />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <NavigationControls />
                            <SettingControls />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden flex flex-col">
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

                        <div className="rounded-md overflow-hidden bg-muted/30 flex-1 relative">
                            {isReadOnly ? (
                                <div
                                    className="relative group h-full"
                                    onClick={(e) => {
                                        lastMouseClickRef.current = { x: e.clientX, y: e.clientY };
                                        setIsReadOnly(false);
                                        setIsPlaying(false);
                                    }}
                                >
                                    <CodeSyntaxHighlighter
                                        code={currentCode || ''}
                                        currentLine={currentLine?.line_number}
                                        onClick={() => {
                                            setIsReadOnly(false);
                                            setIsPlaying(false);
                                        }}
                                        showOverlay={!hasChanges}
                                    />

                                    {/* Edit Button Overlay - only visible on hover */}
                                    <div data-testid="edit-button" className="absolute top-3 right-3 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setIsReadOnly(false);
                                                setIsPlaying(false);
                                            }}
                                            className="shadow-sm"
                                        >
                                            <Pencil className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Editor
                                    data-testid="code-editor-write"
                                    height="100%"
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
                                    onMount={(editor) => {
                                        if (lastMouseClickRef.current) {
                                            const { x, y } = lastMouseClickRef.current;
                                            const trySetCursor = (retriesLeft: number) => {
                                                let target = typeof editor.getTargetAtClientPoint === 'function'
                                                    ? editor.getTargetAtClientPoint(x, y)
                                                    : null;
                                                if (target) {
                                                    setEditorCursorAtClientPosition(editor, y, target);
                                                    lastMouseClickRef.current = null;
                                                } else if (retriesLeft > 0) {
                                                    setTimeout(() => trySetCursor(retriesLeft - 1), 60);
                                                } else {
                                                    setEditorCursorAtClientPosition(editor, y, null);
                                                    lastMouseClickRef.current = null;
                                                }
                                            };
                                            trySetCursor(3);
                                        }
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

// Helper function to set the Monaco editor cursor at a given client (x, y) position
function setEditorCursorAtClientPosition(
    editor: any,
    y: number,
    target?: EditorMouseTarget | null
) {
    let lineNumber = 1;
    let column = 1;
    if (target) {
        if (target.position && target.position !== null) {
            lineNumber = target.position.lineNumber;
            column = target.position.column;
        } else if (target.element && target.mouseColumn) {
            const editorDomNode = editor.getDomNode();
            if (editorDomNode) {
                const rect = editorDomNode.getBoundingClientRect();
                const lineHeight = editor.getOption?.(editor._standaloneKeybindingService?._editorOptions?.lineHeight) || editor.getOption?.('lineHeight') || 22;
                lineNumber = Math.floor((y - rect.top) / lineHeight) + 1;
                column = target.mouseColumn;
            }
        }
    } else {
        // Fallback: estimate line number from DOM
        const editorDomNode = editor.getDomNode();
        if (editorDomNode) {
            const rect = editorDomNode.getBoundingClientRect();
            const lineHeight = editor.getOption?.(editor._standaloneKeybindingService?._editorOptions?.lineHeight) || editor.getOption?.('lineHeight') || 22;
            lineNumber = Math.floor((y - rect.top) / lineHeight) + 1;
        }
    }
    // Clamp line/col
    const model = editor.getModel();
    if (model) {
        lineNumber = Math.max(1, Math.min(lineNumber, model.getLineCount()));
        column = Math.max(1, Math.min(column, model.getLineMaxColumn(lineNumber)));
    }
    editor.setPosition({ lineNumber, column });
    editor.focus();
}