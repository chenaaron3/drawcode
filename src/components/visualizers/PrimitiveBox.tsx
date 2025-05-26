import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { valueVariants } from './variants';

interface PrimitiveBoxProps {
    value: any;
    delta: any;
}

export const PrimitiveBox: React.FC<PrimitiveBoxProps> = ({ value, delta }) => {
    const isNew = delta !== undefined;
    const valueType = typeof value;

    const getValueTypeColor = (type: string, isChanged: boolean) => {
        if (isChanged) {
            switch (type) {
                case 'string': return 'text-emerald-700';
                case 'number': return 'text-blue-700';
                case 'boolean': return 'text-purple-700';
                case 'undefined': return 'text-slate-600';
                default: return 'text-slate-800';
            }
        } else {
            switch (type) {
                case 'string': return 'text-emerald-600';
                case 'number': return 'text-blue-600';
                case 'boolean': return 'text-purple-600';
                case 'undefined': return 'text-slate-500';
                default: return 'text-slate-700';
            }
        }
    };

    const getBackgroundColor = (type: string, isChanged: boolean) => {
        if (isChanged) {
            switch (type) {
                case 'string': return 'bg-emerald-50 border-emerald-200';
                case 'number': return 'bg-blue-50 border-blue-200';
                case 'boolean': return 'bg-purple-50 border-purple-200';
                case 'undefined': return 'bg-slate-50 border-slate-200';
                default: return 'bg-slate-50 border-slate-200';
            }
        } else {
            return 'bg-white border-slate-200';
        }
    };

    const formatValue = (val: any) => {
        if (typeof val === 'string') {
            return `"${val}"`;
        }
        return String(val);
    };

    return (
        <motion.div
            className="flex flex-col items-start"
            initial={isNew ? "initial" : false}
            animate="animate"
            variants={valueVariants}
        >
            <div className={clsx(
                "border rounded-lg px-3 py-2 min-w-[60px] flex items-center justify-center transition-all duration-200 shadow-sm",
                getBackgroundColor(valueType, isNew)
            )}>
                <span className={clsx("font-mono text-sm font-medium", getValueTypeColor(valueType, isNew))}>
                    {formatValue(value)}
                </span>
            </div>
        </motion.div>
    );
}; 