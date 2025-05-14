import { motion } from 'framer-motion';
import React from 'react';

import { PrimitiveBox } from './PrimitiveBox';
import { renderValue } from './renderValue';
import { valueVariants } from './variants';

interface ArrayVisualizerProps {
    values: any[];
    isNew?: boolean;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ values, isNew }) => (
    <motion.div
        className="flex flex-col space-y-1"
        initial={isNew ? "initial" : false}
        animate="animate"
        variants={valueVariants}
    >
        <div className="flex flex-wrap gap-2">
            {values.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-1">[{idx}]</div>
                    {typeof item === 'object' && item !== null ? (
                        <div className="border-2 rounded-md p-2 bg-white">
                            {renderValue(item)}
                        </div>
                    ) : (
                        <PrimitiveBox value={item} isNew={isNew} />
                    )}
                </div>
            ))}
        </div>
    </motion.div>
); 