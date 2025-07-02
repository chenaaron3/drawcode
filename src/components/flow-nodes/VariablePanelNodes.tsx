import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Handle, Position } from 'reactflow';

import { ArrayVisualizer } from '../visualizers/ArrayVisualizer';
import { DictionaryVisualizer } from '../visualizers/DictionaryVisualizer';
import { renderValue } from '../visualizers/renderValue';

import type { ObjectDescriptor } from "@/types/ObjectDescriptor";
// State-based styling system
interface NodeState {
    isEvaluating?: boolean;
    isAnimating?: boolean;
    hasChanged?: boolean;
}

interface NodeStyles {
    container: string;
    handle: string;
    state: 'evaluating' | 'animating' | 'changed' | 'default';
}

function getNodeStyles(state: NodeState, baseClasses: string = '', withGradient: boolean = false): NodeStyles {
    const { isEvaluating, isAnimating, hasChanged } = state;

    // Determine state priority: evaluating > animating > changed > default
    let currentState: NodeStyles['state'];
    let containerClasses: string;
    let handleColor: string;

    if (isEvaluating) {
        currentState = 'evaluating';
        containerClasses = withGradient
            ? 'border border-orange-300 shadow-orange-100 from-orange-100 to-orange-50 ring-2 ring-orange-300'
            : 'border-orange-400 shadow-orange-200 ring-2 ring-orange-300';
        handleColor = '!bg-orange-500';
    } else if (isAnimating) {
        currentState = 'animating';
        containerClasses = withGradient
            ? 'border border-purple-300 shadow-purple-100 from-purple-100 to-purple-50 ring-2 ring-purple-300'
            : 'border-purple-400 shadow-purple-200 ring-2 ring-purple-300';
        handleColor = '!bg-purple-500';
    } else if (hasChanged) {
        currentState = 'changed';
        containerClasses = withGradient
            ? 'border border-green-300 shadow-green-100 from-green-100 to-green-50 ring-2 ring-green-300'
            : 'border-green-400 shadow-green-200 ring-2 ring-green-300';
        handleColor = '!bg-green-500';
    } else {
        currentState = 'default';
        containerClasses = withGradient
            ? 'border border-slate-200 hover:border-slate-300 hover:shadow-md from-white to-slate-50'
            : 'border-slate-300';
        handleColor = '!bg-slate-500';
    }

    return {
        container: clsx(baseClasses, containerClasses),
        handle: clsx('!w-2 !h-2', handleColor),
        state: currentState
    };
}

// Node data interfaces
interface BaseNodeData {
    isAnimating?: boolean;
    hasChanged?: boolean;
    isEvaluating?: boolean;
}

interface ArrayValueNodeData extends BaseNodeData {
    value: any[];
    delta?: any[];
    variableName?: string;
    values: ObjectDescriptor[];
}

interface DictionaryValueNodeData extends BaseNodeData {
    value: Record<string, any>;
    delta?: Record<string, any>;
    variableName?: string;
    entries?: { key: string, value: ObjectDescriptor }[];
}

interface VariablesFrameNodeData {
    label: string;
    variables: Array<{
        name: string;
        value: ObjectDescriptor;
        delta?: any;
        type: 'primitive' | 'complex';
        complexType?: 'array' | 'object';
        isAnimating?: boolean;
        hasChanged?: boolean;
        isEvaluating?: boolean;
    }>;
    inUseVariables?: string[];
}

// Variables Frame Node - Container for all variables
export function VariablesFrameNode({ data }: { data: VariablesFrameNodeData }) {
    const { label, variables, inUseVariables } = data;
    // Filter out variables that are in use (if provided)
    const filteredVariables = inUseVariables
        ? variables.filter(v => !inUseVariables.includes(v.name))
        : variables;

    return (
        <motion.div
            className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-4 min-w-[200px] shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            }}
        >
            {/* Frame title with improved styling */}
            <div className="text-sm font-bold text-slate-800 text-center mb-3 border-b-2 border-slate-400 pb-2 tracking-wide">
                {label}
            </div>

            {/* Variables list with improved styling */}
            <div className="space-y-2">
                {filteredVariables.map((variable) => {
                    return (
                        <motion.div
                            key={variable.name}
                            className={clsx(
                                "flex items-center gap-3 justify-between p-3 rounded-lg transition-all duration-300 cursor-pointer shadow-sm bg-gradient-to-r from-white to-slate-50"
                            )}
                            initial={variable.hasChanged ? { opacity: 0 } : false}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, type: "spring" }}
                        >
                            {/* Variable name */}
                            <span className="text-xs font-mono font-semibold text-slate-700">
                                {variable.name}
                            </span>
                            {/* Variable value or pointer */}
                            <div className="flex items-center relative">
                                {variable.value && variable.value.isCollection
                                    ? renderValue(variable.value, variable.delta, { variableName: variable.name }, `${variable.name}-handle`)
                                    : renderValue(variable.value, variable.delta, { variableName: variable.name })}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    );
}

// Array Value Node - Shows array contents using ArrayVisualizer
export function ArrayValueNode({ data }: { data: ArrayValueNodeData & { values?: ObjectDescriptor[]; objectId?: number } }) {
    const { delta, variableName, isAnimating, hasChanged, isEvaluating, values } = data;
    const styles = getNodeStyles(
        { isEvaluating, isAnimating, hasChanged },
        "bg-gradient-to-br from-white to-slate-50 border-2 rounded-xl p-4 transition-all duration-300 shadow-lg hover:shadow-xl",
        true // Enable gradient support
    );
    return (
        <motion.div
            className={styles.container}
            initial={hasChanged ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            whileHover={{
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            }}
        >
            {/* Handle for incoming connection */}
            <Handle
                type="target"
                position={Position.Left}
                className={styles.handle}
            />
            {/* Array visualizer for array values */}
            <ArrayVisualizer
                values={values || []}
                delta={delta}
                variableName={variableName}
            />
        </motion.div>
    );
}

// Dictionary Value Node - Shows object contents using DictionaryVisualizer
export function DictionaryValueNode({ data }: { data: DictionaryValueNodeData }) {
    const { delta, variableName, isAnimating, hasChanged, isEvaluating, entries } = data;
    const styles = getNodeStyles(
        { isEvaluating, isAnimating, hasChanged },
        "bg-white border-2 rounded-lg p-3 transition-all duration-200 shadow-sm"
    );
    if (!entries) {
        return null;
    }
    return (
        <motion.div
            className={styles.container}
            initial={hasChanged ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, type: "spring" }}
        >
            {/* Handle for incoming connection */}
            <Handle
                type="target"
                position={Position.Left}
                className={styles.handle}
            />
            {/* Dictionary visualizer for dict values */}
            <DictionaryVisualizer
                entries={entries}
                delta={delta}
                variableName={variableName}
            />
        </motion.div>
    );
}

// Export nodeTypes object for React Flow
export const nodeTypes = {
    // Within the variable panel
    variablesFrame: VariablesFrameNode,
    // Outside of variable panel
    arrayValue: ArrayValueNode,
    objectValue: DictionaryValueNode,
};

// Export interfaces for type safety
export type {
    ArrayValueNodeData,
    DictionaryValueNodeData,
    VariablesFrameNodeData,
}; 