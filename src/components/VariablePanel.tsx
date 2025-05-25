import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

import { selectAST, selectCurrentLine, useTraceStore } from '../store/traceStore';
import { renderValue } from './visualizers/renderValue';

import type { Assign, If, For } from '../types/ast';

export default function VariablePanel() {
    const { step, maxStep, traceData } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);
    const ast = useTraceStore(selectAST);

    useEffect(() => {
        console.log(current);
        console.log(ast);
        if (ast === null) {
            return;
        }
        console.log(ast.type);
        // Process ast types here
        if (ast.type === "If") {
            const typedAST = ast as If;
            const condition = typedAST.test;
            console.log("Condition", condition);
        } else if (ast.type === "Assign") {
            const typedAST = ast as Assign;
            const targets = typedAST.targets;
            const value = typedAST.value;
            console.log("Targets", targets);
            console.log("Value", value);
        } else if (ast.type === "For") {
            const typedAST = ast as For;
            const iter = typedAST.iter;
            const target = typedAST.target;
            console.log("Iter", iter);
            console.log("Target", target);
        }
    }, [ast, current]);

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
                    {step === maxStep && (
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