import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { BsFillPauseFill, BsFillPlayFill } from 'react-icons/bs';
import { MdRefresh, MdSkipNext, MdSkipPrevious } from 'react-icons/md';

import { selectCurrentLine, useTraceStore } from '../store/traceStore';

export default function CodePanel() {
    const {
        traceData,
        step,
        maxStep,
        isPlaying,
        playSpeed,
        setStep,
        setIsPlaying,
        setPlaySpeed,
        reset,
        prev,
        next,
        togglePlay
    } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);

    // Handle auto-play
    useEffect(() => {
        let intervalId: number | null = null;

        if (isPlaying && traceData) {
            intervalId = window.setInterval(() => {
                if (step >= traceData.trace.length - 1) {
                    setIsPlaying(false);
                } else {
                    setStep(step + 1);
                }
            }, playSpeed);
        }

        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [isPlaying, playSpeed, traceData, step, setStep, setIsPlaying]);

    if (!traceData || !current) return null;

    return (
        <div className="flex-1">
            {/* Test Inputs */}
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

            {/* Code */}
            <h2 className="text-xl font-semibold mb-4">Code</h2>
            <div className="font-mono bg-gray-50 rounded-md overflow-hidden">
                {traceData.metadata.code.split('\n').map((line, idx) => {
                    const lineNum = idx + 1;
                    const isCurrentLine = current.line_number === lineNum;
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
                        onClick={reset}
                        className="p-2 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={step === 0 || isPlaying}
                        title="Reset"
                    >
                        <MdRefresh size={20} />
                    </motion.button>

                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

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
    );
} 