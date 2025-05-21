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
            className={clsx("border shadow-sm flex flex-col space-y-1 rounded-md p-2", {
                "border-green-500": isNew,
                "bg-green-50": isNew,
            })}
            initial={isNew ? "initial" : false}
            animate="animate"
            variants={valueVariants}
        >
            <div className="flex flex-wrap gap-2">
                {values.length == 0 && <>
                    Empty
                </>}
                {values.map((item, idx) => {
                    const subDelta = delta && delta[idx];
                    return (
                        <div key={idx} className="flex flex-col items-center">
                            <div className="text-xs text-gray-500 mb-1">[{idx}]</div>
                            {renderValue(
                                item,
                                subDelta,
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}; 