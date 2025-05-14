import { motion } from 'framer-motion';
import React from 'react';

import { valueVariants } from './variants';

interface PrimitiveBoxProps {
    value: any;
    label?: string;
    isNew?: boolean;
}

export const PrimitiveBox: React.FC<PrimitiveBoxProps> = ({ value, label, isNew }) => (
    <motion.div
        className="flex flex-col items-start"
        initial={isNew ? "initial" : false}
        animate="animate"
        variants={valueVariants}
    >
        {label && (
            <div className="text-xs text-gray-500 mb-1">{label}</div>
        )}
        <div className="border-2 p-2 rounded-md min-w-[40px] flex justify-center bg-white">
            <span className="font-mono">{String(value)}</span>
        </div>
    </motion.div>
); 