import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { selectCurrentLine, useTraceStore } from '../store/traceStore';
import { getChangeColors, getVariableColors } from './visualizers/colors';
import { renderValue } from './visualizers/renderValue';
import { fadeInScale, fadeInUp } from './visualizers/variants';

import type { AugmentedTraceStep } from '../types/trace';




interface VariableItemProps {
    name: string;
    value: any;
    delta: any;
    isComplex?: boolean;
    isAnimating?: boolean;
}

function VariableItem({ name, value, delta, isComplex = false, isAnimating = false }: VariableItemProps) {
    const isChanged = delta !== undefined;
    const changeColors = getChangeColors(isChanged);

    const labelClasses = `
      font-mono text-sm font-semibold 
      ${changeColors.text}
    `;

    if (isComplex) {
        // Complex variables: keep original layout (label and value side by side)
        const containerClasses = `
          flex flex-col gap-3 p-4 rounded-lg transition-all duration-200 border
          ${getVariableColors(isChanged)}
        `;

        return (
            <motion.div
                className={containerClasses}
                {...fadeInUp}
            >
                <div className="flex items-center justify-center gap-2">
                    <span className={labelClasses}>{name}</span>
                    {isChanged && (
                        <div className={`w-1.5 h-1.5 ${changeColors.indicator} rounded-full`} />
                    )}
                </div>

                <div>
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={`${name}-${JSON.stringify(value)}`}
                            {...fadeInUp}
                        >
                            {renderValue(value, delta, { variableName: name })}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }

    // Simple variables: label on top (centered), value on bottom
    const containerClasses = `
      flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 border
      ${getVariableColors(isChanged)}
      ${isAnimating ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}
    `;

    return (
        <motion.div
            className={containerClasses}
            {...fadeInUp}
        >
            <div className="flex items-center justify-center gap-2">
                <span className={labelClasses}>{name}</span>
                {isChanged && (
                    <div className={`w-1.5 h-1.5 ${changeColors.indicator} rounded-full`} />
                )}
            </div>

            <div>
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={`${name}-${JSON.stringify(value)}`}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{
                            scale: isAnimating ? 1.05 : 1,
                            opacity: isAnimating ? 0.7 : 1,
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            scale: {
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            },
                            opacity: {
                                duration: 0.3
                            }
                        }}
                        style={{
                            transformOrigin: "center center",
                        }}
                    >
                        <div
                            data-variable={name}
                            className={`
                                ${isAnimating
                                    ? 'ring-2 ring-blue-300 ring-opacity-50 shadow-lg'
                                    : ''
                                }
                            `}
                        >
                            {renderValue(value, delta, {
                                variableName: name
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function FinalResult({ result }: { result: any }) {
    return (
        <motion.div {...fadeInScale}>
            <Separator className="my-6" />
            <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100/30 shadow-sm">
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="font-semibold text-emerald-800">Final Result</span>
                    </div>
                    <div className="font-mono text-sm bg-white/60 p-3 rounded-md border border-emerald-200">
                        {JSON.stringify(result)}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function EmptyState() {
    return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
            No variables in scope
        </div>
    );
}

export default function VariablePanel() {
    const { lineIndex: line, maxLine: maxStep, traceData } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);
    const nodeLookup = useTraceStore(state => state.nodeLookup);
    const animatingVariable = useTraceStore(state => state.animatingVariable);
    const [steps, setSteps] = useState<AugmentedTraceStep[] | null>(null);

    useEffect(() => {
        if (current !== null && nodeLookup !== null) {
            setSteps(current.steps.map(step => ({
                ...step,
                ast: nodeLookup.get(step.node_id)!
            })));
        }
    }, [current, nodeLookup]);

    useEffect(() => {
        console.log(steps);
    }, [steps]);

    if (!traceData || !current) return null;

    const variables = Object.entries(current.locals);
    const isSimpleValue = (value: any) => {
        return typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null ||
            value === undefined;
    };

    const simpleVars = variables.filter(([_, value]) => isSimpleValue(value));
    const complexVars = variables.filter(([_, value]) => !isSimpleValue(value));
    const hasVariables = variables.length > 0;
    const showFinalResult = line === maxStep;

    return (
        <div className="h-full flex flex-col">
            <Card className="h-full flex flex-col overflow-visible">
                <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="text-lg">Variables</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 min-h-0 overflow-visible">
                    <div className="h-full overflow-y-auto overflow-x-visible space-y-4">
                        {!hasVariables ? (
                            <EmptyState />
                        ) : (
                            <>
                                {/* Simple Variables */}
                                {simpleVars.length > 0 && (
                                    <div className="flex flex-wrap gap-6 items-start p-2">
                                        {simpleVars.map(([name, value]) => (
                                            <div key={name} className="p-1">
                                                <VariableItem
                                                    name={name}
                                                    value={value}
                                                    delta={current.delta?.[name]}
                                                    isAnimating={animatingVariable === name}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Complex Variables */}
                                {complexVars.length > 0 && (
                                    <>
                                        {simpleVars.length > 0 && <Separator />}
                                        <div className="flex flex-wrap gap-6 items-start p-2">
                                            {complexVars.map(([name, value]) => (
                                                <div key={name} className="p-1">
                                                    <VariableItem
                                                        name={name}
                                                        value={value}
                                                        delta={current.delta?.[name]}
                                                        isComplex
                                                        isAnimating={animatingVariable === name}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {showFinalResult && <FinalResult result={traceData.result} />}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 