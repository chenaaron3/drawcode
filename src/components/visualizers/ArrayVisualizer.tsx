import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { PrimitiveBox } from './PrimitiveBox';
import { renderValue } from './renderValue';
import { valueVariants } from './variants';

interface ArrayVisualizerProps {
    values: any[];
    delta: any[];
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ values, delta }) => {
    const isNew = delta !== undefined;

    return (
        <motion.div
            className={clsx(
                "inline-block border rounded-lg p-3 transition-all duration-200 shadow-sm",
                {
                    "bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200": isNew,
                    "bg-white border-slate-200": !isNew,
                }
            )}
            initial={isNew ? "initial" : false}
            animate="animate"
            variants={valueVariants}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className={clsx("text-xs font-medium", {
                    "text-indigo-700": isNew,
                    "text-slate-600": !isNew
                })}>
                    Array ({values.length})
                </span>
            </div>

            {values.length === 0 ? (
                <div className="text-slate-500 text-sm italic text-center py-2 bg-slate-50 rounded border border-slate-200">
                    Empty
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {values.map((item, idx) => {
                        const subDelta = delta && delta[idx];
                        return (
                            <div key={idx} className="flex flex-col items-center gap-1">
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-center min-w-[24px]">
                                    {idx}
                                </span>
                                {renderValue(item, subDelta)}
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}; 