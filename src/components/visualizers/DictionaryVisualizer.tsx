import { motion } from 'framer-motion';
import React from 'react';

import { renderValue } from './renderValue';
import { valueVariants } from './variants';

interface DictionaryVisualizerProps {
    dict: Record<string, any>;
    isNew?: boolean;
}

export const DictionaryVisualizer: React.FC<DictionaryVisualizerProps> = ({ dict, isNew }) => (
    <motion.div
        className="border rounded-md overflow-hidden shadow-sm inline-block"
        initial={isNew ? "initial" : false}
        animate="animate"
        variants={valueVariants}
    >
        <table className="w-auto border-collapse">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-600 border border-gray-200">Key</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border border-gray-200">Value</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {Object.entries(dict).map(([k, v]) => (
                    <tr key={k} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-sm whitespace-nowrap border border-gray-200 text-center">{k}</td>
                        <td className="px-4 py-2 text-left border border-gray-200">{renderValue(v)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </motion.div>
); 