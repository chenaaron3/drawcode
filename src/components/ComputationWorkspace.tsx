import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { selectCurrentLine, useTraceStore } from '../store/traceStore';

import type { AugmentedTraceStep } from '../types/trace';
interface AnimatedCopy {
    id: string;
    variableName: string;
    value: any;
    startRect: DOMRect;
    targetRect: DOMRect;
    isActive: boolean;
}

interface EvaluationNode {
    nodeId: number;
    value?: any;
    hasValue: boolean;
    children: (string | EvaluationNode)[];
    isHighlighted: boolean;
    offset: number; // Start position of this node in the original line
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
    const stepIndex = useTraceStore(state => state.stepIndex);
    const [steps, setSteps] = useState<AugmentedTraceStep[] | null>(null);
    const [animatedCopies, setAnimatedCopies] = useState<AnimatedCopy[]>([]);
    const [evaluationTree, setEvaluationTree] = useState<EvaluationNode | null>(null);

    useEffect(() => {
        if (current !== null && nodeLookup !== null) {
            setSteps(current.steps.map(step => ({
                ...step,
                ast: nodeLookup.get(step.node_id)!
            })));
        }
    }, [current, nodeLookup]);

    // Initialize evaluation tree when steps change
    useEffect(() => {
        if (steps && steps.length > 0) {
            const initialTree = buildInitialTree();
            setEvaluationTree(initialTree);
        }
    }, [steps]);

    // Update evaluation tree based on current stepIndex
    useEffect(() => {
        if (!steps || !evaluationTree) return;

        // Build tree up to current step
        let currentTree = buildInitialTree();
        if (!currentTree) return;

        for (let i = 0; i <= stepIndex && i < steps.length; i++) {
            const step = steps[i];

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
            const currentStep = steps[stepIndex];

            // Only highlight for before_statement and before_expression events
            if (currentStep.event === 'before_statement' || currentStep.event === 'before_expression') {
                currentTree = highlightNodeInTree(currentTree, currentStep.node_id, true);
            }

            // Handle variable animation for after_expression steps
            if (currentStep.event === 'after_expression' &&
                current?.locals &&
                Object.prototype.hasOwnProperty.call(current.locals, currentStep.focus)) {

                setAnimatingVariable(currentStep.focus);
                setTimeout(() => {
                    createAnimatedCopy(currentStep.focus, currentStep.value);
                }, 200);
                setTimeout(() => {
                    setAnimatingVariable(null);
                }, 800);
            } else {
                setAnimatingVariable(null);
            }
        } else {
            // Clear highlights and animation if no current step
            currentTree = highlightNodeInTree(currentTree, -1, false);
            setAnimatingVariable(null);
        }

        setEvaluationTree(currentTree);
    }, [stepIndex, steps, current]);

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

    // Helper to calculate text length of a node
    const getNodeTextLength = (node: EvaluationNode): number => {
        return node.children.reduce((length, child) => {
            if (typeof child === 'string') {
                return length + child.length;
            } else {
                return length + getNodeTextLength(child);
            }
        }, 0);
    };

    // Replace node value in tree (preserve original structure)
    const replaceNodeValueInTree = (tree: EvaluationNode, targetNodeId: number, value: any): EvaluationNode => {
        if (tree.nodeId === targetNodeId) {
            return {
                ...tree,
                value,
                hasValue: true
                // Keep original children to preserve structure
            };
        }

        return {
            ...tree,
            children: tree.children.map(child =>
                typeof child === 'string' ? child : replaceNodeValueInTree(child, targetNodeId, value)
            )
        };
    };

    // Highlight node in tree (clear all other highlights first)
    const highlightNodeInTree = (tree: EvaluationNode, targetNodeId: number, highlight: boolean): EvaluationNode => {
        const clearAllHighlights = (node: EvaluationNode): EvaluationNode => ({
            ...node,
            isHighlighted: false,
            children: node.children.map(child =>
                typeof child === 'string' ? child : clearAllHighlights(child)
            )
        });

        // First clear all highlights
        let newTree = clearAllHighlights(tree);

        // Then set the specific highlight if needed
        if (highlight) {
            const setHighlight = (node: EvaluationNode): EvaluationNode => ({
                ...node,
                isHighlighted: node.nodeId === targetNodeId,
                children: node.children.map(child =>
                    typeof child === 'string' ? child : setHighlight(child)
                )
            });
            newTree = setHighlight(newTree);
        }

        return newTree;
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
            }, 800); // Reduced from 1000ms to match animation duration
        }
    };

    // Render animated copies as portals
    const renderAnimatedCopies = () => {
        return createPortal(
            <AnimatePresence>
                {animatedCopies.map(copy => (
                    <motion.div
                        key={copy.id}
                        className="fixed pointer-events-none z-[10000] inline-block px-1 py-0.5 rounded font-mono text-sm bg-blue-200 text-blue-800"
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
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 1,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            duration: 0.6,
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

    // Render evaluation tree
    const renderEvaluationNode = (node: EvaluationNode): React.ReactNode => {
        // Check if this node represents a variable by looking at its original text content
        const getVariableName = (node: EvaluationNode): string | undefined => {
            if (node.children.length === 1 && typeof node.children[0] === 'string') {
                const text = node.children[0];
                if (current?.locals && Object.prototype.hasOwnProperty.call(current.locals, text)) {
                    return text;
                }
            }
            return undefined;
        };

        const variableName = getVariableName(node);
        const isAnimatingThis = animatingVariable === variableName;

        // For leaf nodes (single string child) that have been evaluated, show the value
        if (node.hasValue && node.children.length === 1 && typeof node.children[0] === 'string') {
            return (
                <motion.span
                    key={`node-${node.nodeId}`}
                    data-node-id={node.nodeId}
                    data-target={variableName}
                    className={`
                        inline-block px-1 py-0.5 rounded font-mono text-sm
                        ${isAnimatingThis
                            ? 'bg-blue-200 text-blue-800'
                            : node.isHighlighted
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-blue-200 text-blue-800'
                        }
                    `}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {typeof node.value === 'string' ? `"${node.value}"` : JSON.stringify(node.value)}
                </motion.span>
            );
        }

        // For compound expressions that have been evaluated, show value with original structure preserved
        if (node.hasValue && node.children.length > 1) {
            return (
                <motion.span
                    key={`node-${node.nodeId}`}
                    data-node-id={node.nodeId}
                    className={`
                        inline-block px-1 py-0.5 rounded font-mono text-sm
                        ${node.isHighlighted
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                        }
                    `}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {typeof node.value === 'string' ? `"${node.value}"` : JSON.stringify(node.value)}
                </motion.span>
            );
        }

        // Render children for nodes without values or compound expressions
        const renderedChildren = node.children.map((child, index) => {
            if (typeof child === 'string') {
                return <span key={`text-${index}`}>{child}</span>;
            } else {
                return <span key={`child-${child.nodeId}`}>{renderEvaluationNode(child)}</span>;
            }
        });

        return (
            <span
                key={`node-${node.nodeId}`}
                data-node-id={node.nodeId}
                className={`
                    ${node.isHighlighted ? 'bg-yellow-100 text-yellow-800 rounded' : ''}
                    ${isAnimatingThis ? 'bg-blue-100 text-blue-700 rounded' : ''}
                `}
            >
                {renderedChildren}
            </span>
        );
    };

    const renderEvaluationTree = () => {
        if (!evaluationTree) return null;

        return (
            <div className="font-mono text-lg bg-slate-50 p-4 rounded-lg border relative">
                <div className="whitespace-pre-wrap">
                    {renderEvaluationNode(evaluationTree)}
                </div>
            </div>
        );
    };

    if (!current || !steps) {
        return (
            <Card>
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
            <CardContent>
                {renderEvaluationTree()}
            </CardContent>

            {/* Render animated copies */}
            {animatedCopies.length > 0 && renderAnimatedCopies()}
        </Card>
    );
}