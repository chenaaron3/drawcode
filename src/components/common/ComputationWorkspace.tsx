import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { useNextFrameEffect } from '@/hooks/useNextFrame';

import { selectCurrentLine, useTraceStore } from '../../store/traceStore';
import { AnimatedCopies } from '../workspace/AnimatedCopies';
import { EvaluationTree } from '../workspace/EvaluationTree';
import { getNodeTextLength, highlightNodeInTree, replaceNodeValueInTree } from '../workspace/utils';

import type { AugmentedTraceStep } from '../../types/trace';

import type { EvaluationNode } from '../workspace/utils';
import type { AnimatedCopy } from '../workspace/AnimatedCopies';
interface ComputationWorkspaceProps {
    overlayMode?: boolean;
}

export default function ComputationWorkspace({ overlayMode = false }: ComputationWorkspaceProps) {
    const current = useTraceStore(selectCurrentLine);
    const nodeLookup = useTraceStore(state => state.nodeLookup);
    const animatingVariable = useTraceStore(state => state.animatingVariable);
    const setAnimatingVariable = useTraceStore(state => state.setAnimatingVariable);
    const setIsEvaluating = useTraceStore(state => state.setIsEvaluating);
    const stepIndex = useTraceStore(state => state.stepIndex);
    const [steps, setSteps] = useState<AugmentedTraceStep[] | null>(null);
    const [animatedCopies, setAnimatedCopies] = useState<AnimatedCopy[]>([]);
    const [evaluationTree, setEvaluationTree] = useState<EvaluationNode | null>(null);
    const [isAssign, setIsAssign] = useState(false);
    const [pendingAssignmentCopies, setPendingAssignmentCopies] = useState<AnimatedCopy[]>([]);

    useEffect(() => {
        if (current !== null && nodeLookup !== null) {
            setSteps(current.steps
                .map(step => ({
                    ...step,
                    ast: nodeLookup.get(step.node_id)!
                })));
        }
    }, [current, nodeLookup]);

    // Initialize evaluation tree when steps change
    useEffect(() => {
        if (steps && steps.length > 0) {
            console.log(steps);
            const initialTree = buildInitialTree();
            setEvaluationTree(initialTree);
        }
    }, [steps, setEvaluationTree]);

    // Update evaluation tree based on current stepIndex
    useEffect(() => {
        if (!steps || !evaluationTree) return;

        // Build tree up to current step
        let currentTree = buildInitialTree();
        if (!currentTree) return;

        for (let i = 0; i <= stepIndex && i < steps.length; i++) {
            const step = steps[i]!;

            switch (step.event) {
                case 'before_expression':
                    // Wrap the focus substring in a span
                    currentTree = wrapSubstringInTree(currentTree, step.node_id);
                    break;

                case 'after_expression':
                    // Replace the span's text with the value
                    if ('value' in step) {
                        currentTree = replaceNodeValueInTree(currentTree, step.node_id, step.value);
                    }
                    break;
            }
        }

        // Highlight current step if within bounds
        if (stepIndex >= 0 && stepIndex < steps.length) {
            const currentStep = steps[stepIndex]!;

            // Only highlight for before_statement and before_expression events
            if (currentStep.event === 'before_statement' || currentStep.event === 'before_expression' || currentStep.event === 'after_statement') {
                currentTree = highlightNodeInTree(currentTree, currentStep.node_id, true);
            }

            // Highlight the variable if it's being evaluated
            if (currentStep.event === 'after_expression' || currentStep.event === 'before_expression') {
                setAnimatingVariable(currentStep.focus);

                // Set isEvaluating based on the step event
                if (currentStep.event === 'before_expression') {
                    setIsEvaluating(true); // Stage 1: highlighting/evaluating
                } else if (currentStep.event === 'after_expression') {
                    setIsEvaluating(false); // Stage 2: copying/moving
                }

                // Handle variable animation for after_expression steps
                if (currentStep.event === 'after_expression' && current?.locals &&
                    Object.prototype.hasOwnProperty.call(current.locals, currentStep.focus)) {
                    setTimeout(() => {
                        createAnimatedCopy(currentStep.focus, currentStep.value);
                    }, 100);
                }
            } else {
                setAnimatingVariable(null);
                setIsEvaluating(false);
            }
        } else {
            // Clear highlights and animation if no current step
            currentTree = highlightNodeInTree(currentTree, -1, false);
            setAnimatingVariable(null);
            setIsEvaluating(false);
        }
        setEvaluationTree(currentTree);
    }, [stepIndex, steps, current, setAnimatingVariable, setIsEvaluating, setEvaluationTree]);

    // Animate from code to variable panel
    useNextFrameEffect(() => {
        if (!steps) return;
        // Check if we stepped to a new line and need to animate pending assignment copies
        const checkForAssignmentAnimation = () => {
            if (isAssign && stepIndex === 0) {
                // Update the copy to animate to the target
                setAnimatedCopies(pendingAssignmentCopies);
                // Remove after animation
                setTimeout(() => {
                    setAnimatedCopies([]);
                }, 600);

                // Clear pending copies and flag
                setPendingAssignmentCopies([]);
                setIsAssign(false);
            }
        };

        // Check if current step is an assignment completion
        const checkForAssignmentCompletion = () => {
            if (stepIndex >= 0 && steps[stepIndex]) {
                const currentStep = steps[stepIndex];

                // Check if this is the last step of a line with Assign AST and non-null locals
                // We'll determine this by checking if the next step is from a different line
                const isLastStepOfLine = stepIndex === steps.length - 1;
                const isAssignAST = currentStep.ast.type === 'Assign';

                if (currentStep.event === 'after_statement' && isLastStepOfLine && isAssignAST && currentStep.locals) {
                    setIsAssign(true);
                    // Get the last node_id
                    const lastNodeId = steps[stepIndex - 1]!.node_id;
                    let sourceElement = document.querySelector(`[data-node-id="${lastNodeId}"]`);
                    const variableName = currentStep!['focus']!.split("=")![0]!.trim();
                    const variableValue = currentStep.locals[variableName];
                    let targetLambda = () => {
                        const targetElement = document.querySelector(`[data-variable="${variableName}"]`);
                        return targetElement?.getBoundingClientRect();
                    }
                    if (sourceElement) {
                        const startRect = sourceElement.getBoundingClientRect();
                        const copyId = `assignment-${variableName}-${Date.now()}`;
                        const pendingCopy: AnimatedCopy = {
                            id: copyId,
                            variableName,
                            value: variableValue,
                            startRect,
                            targetLambda: targetLambda,
                            isActive: true
                        };
                        setPendingAssignmentCopies([pendingCopy]);
                    }
                }
            }
        };
        checkForAssignmentAnimation();
        checkForAssignmentCompletion();
    }, [stepIndex, steps]);

    // Build initial evaluation tree from the first statement
    const buildInitialTree = (): EvaluationNode | null => {
        if (!steps || !current) return null;

        const traceData = useTraceStore.getState().traceData;
        if (!traceData) return null;

        // Find the first statement
        let firstStatement = steps.find(step => step.event === 'before_statement');
        if (!firstStatement) {
            // Fallback to longest focus expression
            firstStatement = steps.reduce((longest, step) =>
                step.focus.length > longest.focus.length ? step : longest
            );
        }

        // Get the actual source code line instead of the statement focus
        const codeLines = traceData.metadata.code.split('\n');
        const originalLine = codeLines[current.line_number - 1] || '';
        const trimmedLine = originalLine.trim();

        // Calculate how much whitespace was stripped from the beginning
        const strippedWhitespace = originalLine.length - originalLine.trimStart().length;

        return {
            nodeId: firstStatement.node_id,
            hasValue: false,
            children: [trimmedLine],
            isHighlighted: false,
            offset: strippedWhitespace // Start offset accounts for stripped whitespace
        };
    };

    // Find and wrap substring in tree using offset calculations
    const wrapSubstringInTree = (tree: EvaluationNode, targetNodeId: number): EvaluationNode => {
        const targetAst = nodeLookup?.get(targetNodeId);
        if (!targetAst || !targetAst.location) {
            console.warn(`No location data found for node ${targetNodeId}, skipping wrap`);
            return tree;
        }

        const startCol = targetAst.location.col_offset;
        const endCol = targetAst.location.end_col_offset;

        const wrapInNode = (node: EvaluationNode): EvaluationNode => {
            const newNode = { ...node };
            const newChildren: (string | EvaluationNode)[] = [];
            let currentAbsoluteOffset = node.offset;

            for (const child of node.children) {
                if (typeof child === 'string') {
                    const childStart = currentAbsoluteOffset;
                    const childEnd = currentAbsoluteOffset + child.length;

                    // Check if the target span overlaps with this text
                    if (startCol >= childStart && endCol <= childEnd) {
                        // The target is within this text segment
                        const relativeStart = startCol - childStart;
                        const relativeEnd = endCol - childStart;

                        const beforeText = child.substring(0, relativeStart);
                        const targetText = child.substring(relativeStart, relativeEnd);
                        const afterText = child.substring(relativeEnd);

                        if (beforeText) {
                            newChildren.push(beforeText);
                            currentAbsoluteOffset += beforeText.length;
                        }

                        newChildren.push({
                            nodeId: targetNodeId,
                            hasValue: false,
                            children: [targetText],
                            isHighlighted: false,
                            offset: startCol // Use absolute position from AST
                        });
                        currentAbsoluteOffset = endCol; // Jump to end of target

                        if (afterText) {
                            newChildren.push(afterText);
                        }
                    } else {
                        newChildren.push(child);
                    }

                    currentAbsoluteOffset = childEnd;
                } else {
                    // For child nodes, recursively process but keep their absolute offset
                    const wrappedChild = wrapInNode(child);
                    newChildren.push(wrappedChild);
                    // Move past this child's content
                    const childLength = getNodeTextLength(wrappedChild);
                    currentAbsoluteOffset = child.offset + childLength;
                }
            }

            newNode.children = newChildren;
            return newNode;
        };

        return wrapInNode(tree);
    };

    const createAnimatedCopy = (variableName: string, value: any) => {
        // Find the source element (variable in VariablePanel)
        const sourceElement = document.querySelector(`[data-variable="${variableName}"]`);
        // Find the target element (span with data-target in workspace)
        const targetElement = document.querySelector(`[data-target="${variableName}"]`);

        if (sourceElement && targetElement) {
            const startRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();

            const copyId = `${variableName}-${Date.now()}`;
            const newCopy: AnimatedCopy = {
                id: copyId,
                variableName,
                value,
                startRect,
                targetRect,
                isActive: true
            };

            setAnimatedCopies(prev => [...prev, newCopy]);

            // Remove the copy after animation completes
            setTimeout(() => {
                setAnimatedCopies(prev => prev.filter(copy => copy.id !== copyId));
            }, 400);
        }
    };

    if (!current || !steps) {
        if (overlayMode) {
            return (
                <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">
                    No expressions
                </div>
            );
        }
        return (
            <Card className="lg:h-auto">
                <CardContent>
                    <div className="flex items-center justify-center h-16 text-muted-foreground">
                        No expressions to evaluate
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (overlayMode) {
        return (
            <div className="h-full bg-blue-100/80 backdrop-blur-sm rounded border border-blue-300 flex items-center overflow-hidden" data-testid="computation-workspace">
                <div className="text-xs font-mono text-blue-900 truncate">
                    <EvaluationTree
                        evaluationTree={evaluationTree}
                        animatingVariable={animatingVariable}
                        currentLocals={current?.locals || null}
                        overlayMode={true}
                    />
                </div>
                {/* Render animated copies */}
                {animatedCopies.length > 0 && <AnimatedCopies animatedCopies={animatedCopies} />}
            </div>
        );
    }

    return (
        <Card className="h-full" data-testid="computation-workspace">
            <CardContent>
                <EvaluationTree
                    evaluationTree={evaluationTree}
                    animatingVariable={animatingVariable}
                    currentLocals={current?.locals || null}
                    overlayMode={false}
                />
            </CardContent>
            {/* Render animated copies */}
            {animatedCopies.length > 0 && <AnimatedCopies animatedCopies={animatedCopies} />}
        </Card>
    );
}