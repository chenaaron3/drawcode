import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { useTraceStore } from '../../store/traceStore';
import { getValueTypeColors, getVisualizerStyles } from './colors';
import { valueVariants } from './variants';

interface PrimitiveBoxProps {
    value: any;
    delta?: any;
    variableName?: string;
}

function getValueType(value: any): string {
    const type = typeof value;
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return type;
}

function formatValue(value: any): string {
    if (typeof value === 'string') {
        return `"${value}"`;
    }
    return String(value);
}

export const PrimitiveBox: React.FC<PrimitiveBoxProps> = ({ value, delta, variableName }) => {
    const { stepIndex, isEvaluating, animatingVariable } = useTraceStore();
    const isChanged = delta !== undefined && stepIndex === 0;
    const isAnimating = animatingVariable === variableName;
    const isEvaluatingThis = isEvaluating && animatingVariable === variableName;

    const valueType = getValueType(value);
    const colors = getValueTypeColors(valueType, isChanged);

    const containerClasses = clsx(
        "border rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 min-w-[50px] lg:min-w-[60px] flex items-center justify-center transition-all duration-200 shadow-sm",
        getVisualizerStyles({ isEvaluating: isEvaluatingThis, isAnimating, hasChanged: isChanged })
    );

    const textClasses = clsx(
        "font-mono text-xs lg:text-sm font-medium",
        colors.text
    );

    return (
        <motion.div
            className="flex flex-col items-start"
            initial={isChanged ? "initial" : false}
            animate="animate"
            variants={valueVariants}
            data-variable={variableName}
        >
            <div className={containerClasses}>
                <span className={textClasses}>
                    {formatValue(value)}
                </span>
            </div>
        </motion.div>
    );
}; 