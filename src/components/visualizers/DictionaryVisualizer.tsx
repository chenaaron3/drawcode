import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { useTraceStore } from '../../store/traceStore';
import { getDictionaryColors, VISUALIZER_COLORS } from './colors';
import { renderValue } from './renderValue';
import { valueVariants } from './variants';

interface DictionaryVisualizerProps {
    dict: Record<string, any>;
    delta: Record<string, any>;
}

interface DictionaryEntryProps {
    entryKey: string;
    value: any;
    delta: any;
}

function DictionaryEntry({ entryKey, value, delta }: DictionaryEntryProps) {
    const stepIndex = useTraceStore(state => state.stepIndex);
    const isNew = delta !== undefined && stepIndex === 0;

    const containerClasses = clsx(
        "flex items-center gap-2 p-2 transition-all duration-200",
        {
            [VISUALIZER_COLORS.dictionary.changed]: isNew,
            [VISUALIZER_COLORS.dictionary.hover]: !isNew
        }
    );

    const keyClasses = clsx("font-mono text-xs font-semibold", {
        [VISUALIZER_COLORS.dictionary.keyChanged]: isNew,
        [VISUALIZER_COLORS.dictionary.keyDefault]: !isNew
    });

    return (
        <div className={containerClasses}>
            <div className="flex items-center gap-1 flex-shrink-0">
                <span className={keyClasses}>{entryKey}</span>
                {isNew && (
                    <div className={`w-1 h-1 ${VISUALIZER_COLORS.changes.indicator} rounded-full`} />
                )}
            </div>
            <div className="flex-1">
                {renderValue(value, delta)}
            </div>
        </div>
    );
}

function EmptyDictionary() {
    return (
        <div className={`${VISUALIZER_COLORS.empty.text} text-xs italic text-center p-2 ${VISUALIZER_COLORS.empty.background}`}>
            Empty
        </div>
    );
}

export const DictionaryVisualizer: React.FC<DictionaryVisualizerProps> = ({
    dict,
    delta
}) => {
    const stepIndex = useTraceStore(state => state.stepIndex);
    const isNew = delta !== undefined && stepIndex === 0;
    const entries = Object.entries(dict);
    const isEmpty = entries.length === 0;

    const containerClasses = clsx(
        "border rounded-md overflow-hidden transition-all duration-200 mx-auto",
        getDictionaryColors(isNew)
    );

    return (
        <motion.div
            className={containerClasses}
            initial={isNew ? "initial" : false}
            animate="animate"
            variants={valueVariants}
        >
            {isEmpty ? (
                <EmptyDictionary />
            ) : (
                <div className="divide-y divide-slate-200">
                    {entries.map(([key, value]) => (
                        <DictionaryEntry
                            key={key}
                            entryKey={key}
                            value={value}
                            delta={delta && delta[key]}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}; 