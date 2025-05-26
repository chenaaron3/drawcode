import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { selectCurrentLine, useTraceStore } from '../store/traceStore';
import { renderValue } from './visualizers/renderValue';

import type { AugmentedTraceStep } from '../types/trace';

export default function VariablePanel() {
    const { lineIndex: line, maxLine: maxStep, traceData } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);
    const nodeLookup = useTraceStore(state => state.nodeLookup);
    const [steps, setSteps] = useState<AugmentedTraceStep[] | null>(null);

    useEffect(() => {
        console.log(current);
        console.log(steps);
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

    const variableCount = Object.keys(current.locals).length;

    // Helper function to determine if a value is simple (primitive)
    const isSimpleValue = (value: any) => {
        return typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null ||
            value === undefined;
    };

    // Separate simple and complex variables
    const variables = Object.entries(current.locals);
    const simpleVars = variables.filter(([_, value]) => isSimpleValue(value));
    const complexVars = variables.filter(([_, value]) => !isSimpleValue(value));

    return (
        <div className="flex-1 flex flex-col">
            <Card className="flex-1 h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                        Variables
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <div className="space-y-4 h-full overflow-auto">
                        {variableCount === 0 ? (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                                No variables in scope
                            </div>
                        ) : (
                            <>
                                {/* Simple Variables - Compact Grid Layout */}
                                {simpleVars.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {simpleVars.map(([name, value], index) => {
                                            const delta = current.delta?.[name];
                                            const isChanged = delta !== undefined;

                                            return (
                                                <motion.div
                                                    key={name}
                                                    className={`
                                                        flex items-center justify-between p-3 rounded-lg transition-all duration-200 border
                                                        ${isChanged
                                                            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200'
                                                            : 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-200/50'
                                                        }
                                                    `}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                >
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className={`font-mono text-sm font-semibold ${isChanged ? 'text-emerald-700' : 'text-slate-700'
                                                            }`}>
                                                            {name}
                                                        </span>
                                                        {isChanged && (
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <AnimatePresence mode="popLayout">
                                                            <motion.div
                                                                key={`${name}-${JSON.stringify(value)}`}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 10 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                {renderValue(value, delta)}
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Complex Variables - Full Width Layout */}
                                {complexVars.length > 0 && (
                                    <div className="space-y-3">
                                        {simpleVars.length > 0 && <Separator />}
                                        {complexVars.map(([name, value], index) => {
                                            const delta = current.delta?.[name];
                                            const isChanged = delta !== undefined;

                                            return (
                                                <motion.div
                                                    key={name}
                                                    className={`
                                                        flex flex-col gap-3 p-4 rounded-lg transition-all duration-200 border
                                                        ${isChanged
                                                            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200'
                                                            : 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-200/50'
                                                        }
                                                    `}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: (simpleVars.length + index) * 0.02 }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-mono text-sm font-semibold ${isChanged ? 'text-emerald-700' : 'text-slate-700'
                                                            }`}>
                                                            {name}
                                                        </span>
                                                        {isChanged && (
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <AnimatePresence mode="popLayout">
                                                            <motion.div
                                                                key={`${name}-${JSON.stringify(value)}`}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 20 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                {renderValue(value, delta)}
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Final Result */}
                        {line === maxStep && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Separator className="my-6" />
                                <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100/30 shadow-sm">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            <span className="font-semibold text-emerald-800">Final Result</span>
                                        </div>
                                        <div className="font-mono text-sm bg-white/60 p-3 rounded-md border border-emerald-200">
                                            {JSON.stringify(traceData.result)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 