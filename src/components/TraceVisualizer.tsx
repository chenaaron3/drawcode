import { AnimatePresence, motion } from 'framer-motion';
import { h3 } from 'framer-motion/client';
import React, { useEffect, useState } from 'react';

export type TraceData = {
    metadata: {
        code: string;
        function: string;
        inputs: {
            kwargs: Record<string, string>;
        };
    };
    trace: Array<{
        line_number: number;
        locals: Record<string, any>;
        delta: Record<string, any>;
        eval_result?: any;
    }>;
    result: any;
};

interface VisualizerProps {
    traceUrl?: string;
    traceData?: TraceData;
}

export default function TraceVisualizer({ traceUrl, traceData: initialData }: VisualizerProps) {
    const [traceData, setTraceData] = useState<TraceData | null>(initialData || null);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!initialData && traceUrl) {
            fetch(traceUrl)
                .then(res => res.json())
                .then((data: TraceData) => setTraceData(data))
                .catch(console.error);
        }
    }, [traceUrl, initialData]);

    if (!traceData) return <p>Loading trace...</p>;

    const current = traceData.trace[step];
    const maxStep = traceData.trace.length - 1;

    const next = () => setStep(s => Math.min(s + 1, maxStep));
    const prev = () => setStep(s => Math.max(s - 1, 0));

    // Helper: render a value based on its type
    function renderValue(val: any, isNew: boolean = false) {
        const valueVariants = {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 }
        };

        if (Array.isArray(val)) {
            return (
                <motion.div
                    className="flex space-x-1"
                    initial={isNew ? "initial" : false}
                    animate="animate"
                    variants={valueVariants}
                >
                    {val.map((item, idx) => (
                        <motion.div
                            key={idx}
                            className="border p-1 rounded"
                            whileHover={{ scale: 1.05 }}
                        >
                            {renderValue(item)}
                        </motion.div>
                    ))}
                </motion.div>
            );
        }
        if (val && typeof val === 'object') {
            return (
                <motion.table
                    className="table-auto border-collapse border"
                    initial={isNew ? "initial" : false}
                    animate="animate"
                    variants={valueVariants}
                >
                    <tbody>
                        {Object.entries(val).map(([k, v]) => (
                            <motion.tr
                                key={k}
                                initial={isNew ? "initial" : false}
                                animate="animate"
                                variants={valueVariants}
                            >
                                <td className="border p-1 font-semibold">{k}</td>
                                <td className="border p-1">{renderValue(v)}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </motion.table>
            );
        }
        // primitive
        return (
            <motion.span
                initial={isNew ? "initial" : false}
                animate="animate"
                variants={valueVariants}
            >
                {String(val)}
            </motion.span>
        );
    }

    return (
        <div>
            {/* Title */}
            <h1 className="text-3xl font-bold text-center py-8">
                LeetCode Trace Visualizer
            </h1>
            {/* Main content */}
            <div className="w-full flex flex-row mx-auto px-8">
                {/* Problem Info */}
                <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-4">Test Inputs</h2>
                    <div className="font-mono bg-gray-50 p-4 rounded-md mb-8">
                        {Object.entries(traceData.metadata.inputs.kwargs).map(([key, value]) => (
                            <div key={key} className="mb-2">
                                <span className="font-bold">{key}</span>
                                <span> = </span>
                                <span>{value}</span>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Code</h2>
                    <div className="font-mono bg-gray-50 rounded-md overflow-hidden">
                        {traceData.metadata.code.split('\n').map((line, idx) => {
                            // Add 1 because line numbers in trace are 1-indexed
                            const lineNum = idx + 1;
                            const isCurrentLine = current?.line_number === lineNum;

                            // Calculate leading spaces and convert to non-breaking spaces
                            const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;
                            const indentedLine = '\u00A0'.repeat(leadingSpaces) + line.trimStart();

                            return (
                                <motion.div
                                    key={idx}
                                    className={`
                                        px-4 py-1 flex items-center whitespace-pre
                                        ${isCurrentLine ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}
                                    `}
                                    animate={{
                                        backgroundColor: isCurrentLine ? 'rgb(219 234 254)' : 'transparent',
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.span
                                        className="text-gray-500 mr-4 select-none inline-block w-8 text-right"
                                        initial={false}
                                        animate={{ opacity: isCurrentLine ? 1 : 0.5 }}
                                    >
                                        {lineNum}
                                    </motion.span>
                                    <span className="flex-1 font-mono">{indentedLine}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Variables panel */}
                <div className="flex-1 flex flex-col h-full ml-8">
                    <motion.h2
                        className="text-xl font-semibold mb-4"
                        initial={false}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 0.3 }}
                    >
                        Variables & State
                    </motion.h2>
                    <div className="bg-white p-6 rounded-lg shadow-inner overflow-auto flex-grow">
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <AnimatePresence mode="wait">
                                    {current?.locals && Object.entries(current.locals).map(([name, value]) => {
                                        const isNewValue = current.delta && current.delta[name];
                                        return (
                                            <motion.div
                                                key={name}
                                                className="flex items-start gap-4"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <motion.div
                                                    className="font-mono w-32 pt-2 shrink-0"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    {name}
                                                </motion.div>
                                                <motion.div
                                                    className={`p-3 rounded-md border transition-colors duration-300 flex-1 ${isNewValue ? 'border-green-500 bg-green-50' : ''}`}
                                                    animate={{
                                                        borderColor: isNewValue ? '#22c55e' : '#e5e7eb',
                                                        backgroundColor: isNewValue ? 'rgb(240 253 244)' : 'transparent'
                                                    }}
                                                >
                                                    {renderValue(value, isNewValue)}
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence>
                                {current?.eval_result !== undefined && (
                                    <motion.div
                                        className="mt-4 p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-md"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <strong>Eval:</strong> {JSON.stringify(current.eval_result)}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Final Result */}
                            {step === maxStep && (
                                <motion.div
                                    className="mt-4 p-3 border-l-4 border-green-400 bg-green-50 rounded-r-md"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <strong>Result:</strong> {JSON.stringify(traceData.result)}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-4 flex justify-center space-x-4">
                        <motion.button
                            onClick={prev}
                            className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={step === 0}
                        >
                            ← Previous
                        </motion.button>
                        <motion.button
                            onClick={next}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={step === maxStep}
                        >
                            Next →
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}