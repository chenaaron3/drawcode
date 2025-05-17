import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { BsFillPauseFill, BsFillPlayFill } from 'react-icons/bs';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';

import { renderValue } from './visualizers/renderValue';
import { valueVariants } from './visualizers/variants';

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
    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(1000); // milliseconds between steps

    useEffect(() => {
        if (!initialData && traceUrl) {
            fetch(traceUrl)
                .then(res => res.json())
                .then((data: TraceData) => setTraceData(data))
                .catch(console.error);
        }
    }, [traceUrl, initialData]);

    useEffect(() => {
        let intervalId: number | null = null;

        if (isPlaying && traceData) {
            intervalId = window.setInterval(() => {
                setStep(s => {
                    if (s >= traceData.trace.length - 1) {
                        setIsPlaying(false);
                        return s;
                    }
                    return s + 1;
                });
            }, playSpeed);
        }

        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [isPlaying, playSpeed, traceData]);

    if (!traceData) return <p>Loading trace...</p>;

    const current = traceData.trace[step];
    const maxStep = traceData.trace.length - 1;

    const next = () => setStep(s => Math.min(s + 1, maxStep));
    const prev = () => setStep(s => Math.max(s - 1, 0));

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <div>
            {/* Title */}
            <h1 className="text-3xl font-bold text-center py-8">
                {traceData.metadata.function
                    .split(/(?=[A-Z])|_/)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')}
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
                            const lineNum = idx + 1;
                            const isCurrentLine = current?.line_number === lineNum;
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

                    {/* Controls */}
                    <div className="mt-4 mb-8 flex justify-center items-center">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex items-center p-1 space-x-1">
                            <motion.button
                                onClick={prev}
                                className="p-2 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={step === 0 || isPlaying}
                                title="Previous"
                            >
                                <MdSkipPrevious size={20} />
                            </motion.button>

                            <motion.button
                                onClick={togglePlay}
                                className="p-2 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={step === maxStep}
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? <BsFillPauseFill size={20} /> : <BsFillPlayFill size={20} />}
                            </motion.button>

                            <motion.button
                                onClick={next}
                                className="p-2 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={step === maxStep || isPlaying}
                                title="Next"
                            >
                                <MdSkipNext size={20} />
                            </motion.button>

                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                            <select
                                value={playSpeed}
                                onChange={(e) => setPlaySpeed(Number(e.target.value))}
                                className="p-2 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-none focus:ring-0 focus:outline-none"
                                disabled={isPlaying}
                                title="Playback Speed"
                            >
                                <option value={2000}>0.5×</option>
                                <option value={1000}>1×</option>
                                <option value={500}>2×</option>
                                <option value={250}>4×</option>
                            </select>
                        </div>
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
                        Variable State
                    </motion.h2>
                    <div className="bg-white p-6 rounded-lg shadow-inner overflow-auto flex-grow">
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {current?.locals && Object.entries(current.locals).map(([name, value]) => {
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
                                            <div className="flex-none">
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
            </div>
        </div>
    );
}