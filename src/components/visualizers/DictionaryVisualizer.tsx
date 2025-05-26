import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

import { renderValue } from './renderValue';
import { valueVariants } from './variants';

interface DictionaryVisualizerProps {
    dict: Record<string, any>;
    delta: Record<string, any>;
}

export const DictionaryVisualizer: React.FC<DictionaryVisualizerProps> = ({ dict, delta }) => {
    const isNew = delta !== undefined;
    const entries = Object.entries(dict);

    return (
        <motion.div
            className={clsx(
                "inline-block border rounded-lg overflow-hidden transition-all duration-200 shadow-sm",
                {
                    "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200": isNew,
                    "bg-white border-slate-200": !isNew,
                }
            )}
            initial={isNew ? "initial" : false}
            animate="animate"
            variants={valueVariants}
        >
            <div className={clsx("px-3 py-2 border-b", {
                "bg-amber-100/50 border-amber-200": isNew,
                "bg-slate-50 border-slate-200": !isNew
            })}>
                <div className="flex items-center gap-2">
                    <span className={clsx("text-xs font-medium", {
                        "text-amber-700": isNew,
                        "text-slate-600": !isNew
                    })}>
                        Dictionary ({entries.length})
                    </span>
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="text-slate-500 text-sm italic text-center py-3 bg-slate-50">
                    Empty
                </div>
            ) : (
                <div className="divide-y divide-slate-200">
                    {entries.map(([k, v], index) => {
                        const subDelta = delta && delta[k];
                        const hasChange = subDelta !== undefined;

                        return (
                            <div
                                key={k}
                                className={clsx(
                                    "flex items-center gap-3 p-3 transition-all duration-200",
                                    {
                                        "bg-gradient-to-r from-emerald-50 to-emerald-100/30": hasChange,
                                        "hover:bg-slate-50": !hasChange
                                    }
                                )}
                            >
                                <div className="flex items-center gap-2 flex-shrink-0 min-w-[40px]">
                                    <span className={clsx("font-mono text-sm font-semibold", {
                                        "text-emerald-700": hasChange,
                                        "text-slate-700": !hasChange
                                    })}>
                                        {k}
                                    </span>
                                    {hasChange && (
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    {renderValue(v, subDelta)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}; 