import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { useTraceStore } from '../../store/traceStore';
import { getValueTypeColors } from './colors';
import { valueVariants } from './variants';

interface PrimitiveBoxProps {
    value: any;
    delta: any;
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

export const PrimitiveBox: React.FC<PrimitiveBoxProps> = ({ value, delta }) => {
    const stepIndex = useTraceStore(state => state.stepIndex);
    const isNew = delta !== undefined && stepIndex === 0;
    const valueType = getValueType(value);
    const colors = getValueTypeColors(valueType, isNew);

    const containerClasses = clsx(
        "border rounded-lg px-3 py-2 min-w-[60px] flex items-center justify-center transition-all duration-200 shadow-sm",
        colors.background
    );

    const textClasses = clsx(
        "font-mono text-sm font-medium",
        colors.text
    );

    return (
        <motion.div
            className="flex flex-col items-start"
            initial={isNew ? "initial" : false}
            animate="animate"
            variants={valueVariants}
        >
            <div className={containerClasses}>
                <span className={textClasses}>
                    {formatValue(value)}
                </span>
            </div>
        </motion.div>
    );
}; 