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
    return <motion.div
        className={`flex flex-col items-start`}
        initial={isNew ? "initial" : false}
        animate="animate"
        variants={valueVariants}
    >
        <div className={clsx("border-2 p-2 rounded-md min-w-[40px] flex justify-center", {
            "bg-green-200": isNew
        })}>
            <span className="font-mono">{String(value)}</span>
        </div>
    </motion.div>
}; 