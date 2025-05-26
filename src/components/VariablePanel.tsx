import { AnimatePresence, motion, steps } from 'framer-motion';
import { line } from 'framer-motion/client';
import { useEffect, useState } from 'react';

import { selectCurrentLine, useTraceStore } from '../store/traceStore';
import { renderValue } from './visualizers/renderValue';

import type { AugmentedTraceStep } from '../types/trace';
export default function VariablePanel() {
    const { line, maxLine: maxStep, traceData } = useTraceStore();
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

    return (
        <div className="flex-1 flex flex-col">
            <motion.h2
                className="text-xl font-semibold mb-4"
                initial={false}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.3 }}
            >
                Variable State
            </motion.h2>
            <div className="bg-white p-6 rounded-lg shadow-inner overflow-auto flex-grow">
                <div className="space-y-4">
                    <div className="space-y-3">
                        {Object.entries(current.locals).map(([name, value]) => {
                            const delta = current.delta?.[name];
                            return (
                                <div
                                    key={name}
                                    className="flex items-start gap-4"
                                >
                                    <div
                                        className="font-mono w-32 pt-2 text-sm text-gray-600"
                                    >
                                        {name}
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
                                </div>
                            );
                        })}
                    </div>

                    {/* Final Result */}
                    {line === maxStep && (
                        <motion.div
                            className="mt-4 p-3 border-l-4 border-green-400 bg-green-200 rounded-r-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <strong>Result:</strong> {JSON.stringify(traceData.result)}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
} 