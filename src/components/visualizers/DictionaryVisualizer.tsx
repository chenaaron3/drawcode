import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { useTraceStore } from '../../store/traceStore';
import { getVisualizerStyles } from './colors';
import { renderValue } from './renderValue';
import { valueVariants } from './variants';

interface DictionaryVisualizerProps {
    dict: Record<string, any>;
    delta?: Record<string, any>;
    variableName?: string;
}

interface DictionaryEntryProps {
    entryKey: string;
    value: any;
    delta?: any;
}

function DictionaryEntry({ entryKey, value, delta }: DictionaryEntryProps) {
    const stepIndex = useTraceStore(state => state.stepIndex);
    const isChanged = delta !== undefined && stepIndex === 0;

    const containerClasses = clsx(
        "flex items-center gap-2 p-2 transition-all duration-200",
        isChanged
            ? "bg-gradient-to-r from-emerald-50/80 to-green-50/80" // Changed state
            : "hover:bg-slate-50/80" // Default hover state
    );

    const keyClasses = clsx(
        "font-mono text-xs font-semibold",
        isChanged ? "text-emerald-800" : "text-slate-800"
    );

    return (
        <div className={containerClasses}>
            <div className="flex items-center gap-1 flex-shrink-0">
                <span className={keyClasses}>{entryKey}</span>
            </div>
            <div className="flex-1">
                {renderValue(value, delta)}
            </div>
        </div>
    );
}

function EmptyDictionary() {
    return (
        <div className="text-slate-500 text-xs italic text-center p-2 bg-slate-50/80">
            Empty
        </div>
    );
}

export const DictionaryVisualizer: React.FC<DictionaryVisualizerProps> = ({
    dict,
    delta,
    variableName
}) => {
    const { stepIndex, isEvaluating, animatingVariable } = useTraceStore();
    const isChanged = delta !== undefined && stepIndex === 0;
    const isAnimating = animatingVariable === variableName;
    const isEvaluatingThis = isEvaluating && animatingVariable === variableName;

    const entries = Object.entries(dict);
    const isEmpty = entries.length === 0;

    const containerClasses = clsx(
        "border rounded-md overflow-hidden transition-all duration-200 mx-auto",
        getVisualizerStyles({ isEvaluating: isEvaluatingThis, isAnimating, hasChanged: isChanged })
    );

    return (
        <motion.div
            className={containerClasses}
            initial={isChanged ? "initial" : false}
            animate="animate"
            variants={valueVariants}
            data-variable={variableName}
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
                            delta={delta?.[key]}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}; 