import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { selectCurrentLine, useTraceStore } from '../store/traceStore';

import type { AugmentedTraceStep } from '../types/trace';

interface ExpressionReplacement {
    original: string;
    value: any;
    startIndex: number;
    endIndex: number;
    variableName?: string;
}

interface AnimatedCopy {
    id: string;
    variableName: string;
    value: any;
    startRect: DOMRect;
    targetRect: DOMRect;
    isActive: boolean;
}

// Helper function to extract the first line of a multi-line statement
function getFirstLine(text: string): string {
    const lines = text.split('\n');
    return lines[0].trim();
}

export default function ComputationWorkspace() {
    const current = useTraceStore(selectCurrentLine);
    const nodeLookup = useTraceStore(state => state.nodeLookup);
    const animatingVariable = useTraceStore(state => state.animatingVariable);
    const setAnimatingVariable = useTraceStore(state => state.setAnimatingVariable);
    const [steps, setSteps] = useState<AugmentedTraceStep[] | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const [replacements, setReplacements] = useState<ExpressionReplacement[]>([]);
    const [animatedCopies, setAnimatedCopies] = useState<AnimatedCopy[]>([]);

    const createAnimatedCopy = (variableName: string, value: any) => {
        console.log('Creating animated copy for:', variableName);

        // Debug: log all elements with data-variable and data-target
        const allDataVariable = document.querySelectorAll('[data-variable]');
        const allDataTarget = document.querySelectorAll('[data-target]');
        console.log('All data-variable elements:', allDataVariable);
        console.log('All data-target elements:', allDataTarget);

        // Find the source element (variable in VariablePanel)
        const sourceElement = document.querySelector(`[data-variable="${variableName}"]`);
        // Find the target element (placeholder in workspace)
        const targetElement = document.querySelector(`[data-target="${variableName}"]`);

        console.log('Source element:', sourceElement);
        console.log('Target element:', targetElement);

        if (sourceElement && targetElement) {
            const startRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();

            console.log('Start rect:', startRect);
            console.log('Target rect:', targetRect);

            const copyId = `${variableName}-${Date.now()}`;
            const newCopy: AnimatedCopy = {
                id: copyId,
                variableName,
                value,
                startRect,
                targetRect,
                isActive: true
            };

            console.log('Creating copy:', newCopy);
            setAnimatedCopies(prev => [...prev, newCopy]);

            // Remove the copy after animation completes
            setTimeout(() => {
                setAnimatedCopies(prev => prev.filter(copy => copy.id !== copyId));
            }, 1000);
        } else {
            console.log('Could not find source or target element');
        }
    };

    useEffect(() => {
        if (current !== null && nodeLookup !== null) {
            setSteps(current.steps.map(step => ({
                ...step,
                ast: nodeLookup.get(step.node_id)!
            })));
        }
    }, [current, nodeLookup]);

    useEffect(() => {
        if (steps && steps.length > 0) {
            // Get the main statement focus (usually the first step)
            const mainStatementFull = steps.find(step =>
                step.event === 'before_statement' || step.event === 'after_statement'
            )?.focus || '';

            // Extract only the first line for display
            const mainStatement = getFirstLine(mainStatementFull);

            // Extract expression evaluations
            const expressionSteps = steps.filter(step =>
                step.event === 'after_expression' && 'value' in step
            );

            // Create replacements for each expression
            const reps: ExpressionReplacement[] = expressionSteps.map(step => {
                const original = step.focus;
                const startIndex = mainStatement.indexOf(original);

                // Try to identify if this expression corresponds to a variable
                let variableName: string | undefined;
                if (current?.locals) {
                    const stepValue = step.value;
                    for (const [varName, varValue] of Object.entries(current.locals)) {
                        if (JSON.stringify(varValue) === JSON.stringify(stepValue)) {
                            variableName = varName;
                            break;
                        }
                    }
                }

                return {
                    original,
                    value: step.value,
                    startIndex,
                    endIndex: startIndex + original.length,
                    variableName
                };
            }).filter(rep => rep.startIndex !== -1)
                .sort((a, b) => b.startIndex - a.startIndex); // Sort by position, reverse order for replacement

            setReplacements(reps);
            setDisplayText(mainStatement);
            setIsAnimating(false);
            setAnimatingVariable(null);
        }
    }, [steps, current, setAnimatingVariable]);

    const startAnimation = () => {
        if (replacements.length === 0) return;

        console.log('Starting animation with replacements:', replacements);
        setIsAnimating(true);

        // Reset to original text
        const originalTextFull = steps?.find(step =>
            step.event === 'before_statement' || step.event === 'after_statement'
        )?.focus || '';
        const originalText = getFirstLine(originalTextFull);
        setDisplayText(originalText);

        // Animate through each replacement with proper timing for layout animations
        const animateNextStep = (index: number) => {
            if (index >= replacements.length) {
                setIsAnimating(false);
                setAnimatingVariable(null);
                console.log('Animation complete');
                return;
            }

            const replacement = replacements[index];
            console.log('Animating step', index, 'for variable:', replacement.variableName);

            // Set the variable that's being animated
            if (replacement.variableName) {
                const varName = replacement.variableName;
                setAnimatingVariable(varName);

                // First apply the text replacement to create the target element
                setTimeout(() => {
                    console.log('Applying text replacement for:', varName);
                    setDisplayText(prevText => {
                        let newText = prevText;
                        const valueStr = typeof replacement.value === 'string'
                            ? `"${replacement.value}"`
                            : JSON.stringify(replacement.value);

                        newText = newText.substring(0, replacement.startIndex) +
                            valueStr +
                            newText.substring(replacement.endIndex);

                        return newText;
                    });

                    // Then create animated copy from variable to workspace
                    setTimeout(() => {
                        createAnimatedCopy(varName, replacement.value);
                    }, 100); // Small delay to ensure target element is rendered after text replacement

                    // Clear the animating variable and continue to next step
                    setTimeout(() => {
                        setAnimatingVariable(null);
                        setTimeout(() => animateNextStep(index + 1), 1000);
                    }, 800);
                }, 200); // Short delay to ensure animation state is set
            } else {
                // If no variable name, just apply the replacement immediately
                setDisplayText(prevText => {
                    let newText = prevText;
                    const valueStr = typeof replacement.value === 'string'
                        ? `"${replacement.value}"`
                        : JSON.stringify(replacement.value);

                    newText = newText.substring(0, replacement.startIndex) +
                        valueStr +
                        newText.substring(replacement.endIndex);

                    return newText;
                });

                setTimeout(() => animateNextStep(index + 1), 400);
            }
        };

        animateNextStep(0);
    };

    const renderInlineText = () => {
        if (!displayText) return null;

        // Split the text to identify parts that can be animated
        const parts = [];
        let remainingText = displayText;

        // Find variable values in the current text that match our locals
        if (current?.locals) {
            // Sort variables by value length (longest first) to avoid partial matches
            const sortedVars = Object.entries(current.locals).sort((a, b) => {
                const aStr = typeof a[1] === 'string' ? `"${a[1]}"` : JSON.stringify(a[1]);
                const bStr = typeof b[1] === 'string' ? `"${b[1]}"` : JSON.stringify(b[1]);
                return bStr.length - aStr.length;
            });

            for (const [varName, varValue] of sortedVars) {
                const valueStr = typeof varValue === 'string'
                    ? `"${varValue}"`
                    : JSON.stringify(varValue);

                const index = remainingText.indexOf(valueStr);
                if (index !== -1) {
                    // Add text before the value
                    if (index > 0) {
                        parts.push({
                            type: 'text',
                            content: remainingText.substring(0, index),
                            key: `text-${parts.length}`
                        });
                    }

                    // Add the value with animation
                    parts.push({
                        type: 'value',
                        content: valueStr,
                        variableName: varName,
                        key: `value-${varName}`
                    });

                    // Update remaining text
                    remainingText = remainingText.substring(index + valueStr.length);
                    break; // Only replace first occurrence
                }
            }
        }

        // Add any remaining text
        if (remainingText.length > 0) {
            parts.push({
                type: 'text',
                content: remainingText,
                key: `text-final`
            });
        }

        // If no parts were created, just show the whole text
        if (parts.length === 0) {
            parts.push({
                type: 'text',
                content: displayText,
                key: 'text-all'
            });
        }

        return (
            <div className="font-mono text-lg bg-slate-50 p-4 rounded-lg border relative">
                <div className="whitespace-pre-wrap">
                    {parts.map(part => {
                        if (part.type === 'value' && part.variableName) {
                            return (
                                <motion.span
                                    key={part.key}
                                    data-target={part.variableName}
                                    className={`
                                        inline-block px-2 py-1 rounded font-mono text-sm
                                        ${animatingVariable === part.variableName
                                            ? 'bg-blue-200 text-blue-800 shadow-lg ring-2 ring-blue-300'
                                            : 'bg-emerald-100 text-emerald-800'
                                        }
                                    `}
                                    initial={{
                                        opacity: animatingVariable === part.variableName ? 0 : 1,
                                        scale: 0.8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    transition={{
                                        delay: animatingVariable === part.variableName ? 0.5 : 0,
                                        duration: 0.3
                                    }}
                                    style={{
                                        transformOrigin: "center center",
                                    }}
                                >
                                    {part.content}
                                </motion.span>
                            );
                        }
                        return (
                            <span key={part.key}>
                                {part.content}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render animated copies as portals
    const renderAnimatedCopies = () => {
        return createPortal(
            <AnimatePresence>
                {animatedCopies.map(copy => (
                    <motion.div
                        key={copy.id}
                        className="fixed pointer-events-none z-[10000] inline-block px-2 py-1 rounded font-mono text-sm bg-blue-200 text-blue-800 shadow-lg ring-2 ring-blue-300"
                        initial={{
                            left: copy.startRect.left,
                            top: copy.startRect.top,
                            width: copy.startRect.width,
                            height: copy.startRect.height,
                            opacity: 1,
                            scale: 1,
                        }}
                        animate={{
                            left: copy.targetRect.left,
                            top: copy.targetRect.top,
                            width: copy.targetRect.width,
                            height: copy.targetRect.height,
                            opacity: 0.8,
                            scale: 1.05,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.8,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 25,
                            duration: 0.8,
                        }}
                        style={{
                            transformOrigin: "center center",
                        }}
                    >
                        {typeof copy.value === 'string' ? `"${copy.value}"` : JSON.stringify(copy.value)}
                    </motion.div>
                ))}
            </AnimatePresence>,
            document.body
        );
    };

    if (!current || !steps || replacements.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Computation Workspace</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-16 text-muted-foreground">
                        No expressions to evaluate
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Computation Workspace</CardTitle>
                    <button
                        onClick={startAnimation}
                        disabled={isAnimating}
                        className={`
              px-3 py-1 text-sm rounded-md font-medium transition-colors
              ${isAnimating
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }
            `}
                    >
                        {isAnimating ? 'Evaluating...' : 'Animate'}
                    </button>
                </div>
                <div className="text-sm text-slate-600">
                    Line {current.line_number}
                </div>
            </CardHeader>

            <CardContent>
                {renderInlineText()}
            </CardContent>

            {/* Render animated copies */}
            {animatedCopies.length > 0 && renderAnimatedCopies()}
        </Card>
    );
} 