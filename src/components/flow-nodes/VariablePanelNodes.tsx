import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Handle, Position } from 'reactflow';

import { ArrayVisualizer } from '../visualizers/ArrayVisualizer';
import { DictionaryVisualizer } from '../visualizers/DictionaryVisualizer';
import { PrimitiveBox } from '../visualizers/PrimitiveBox';

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

interface PrimitiveVariableNodeData extends BaseNodeData {
    name: string;
    value: any;
    delta?: any;
    variableName?: string;
}

interface ComplexVariableNodeData extends BaseNodeData {
    name: string;
    type: 'array' | 'object';
}

interface ArrayValueNodeData extends BaseNodeData {
    value: any[];
    delta?: any[];
    variableName?: string;
}

interface ObjectValueNodeData extends BaseNodeData {
    value: Record<string, any>;
    delta?: Record<string, any>;
    variableName?: string;
}

interface VariablesFrameNodeData {
    label: string;
    variables: Array<{
        name: string;
        value: any;
        delta?: any;
        type: 'primitive' | 'complex';
        complexType?: 'array' | 'object';
        isAnimating?: boolean;
        hasChanged?: boolean;
        isEvaluating?: boolean;
    }>;
}

// Variables Frame Node - Container for all variables
export function VariablesFrameNode({ data }: { data: VariablesFrameNodeData }) {
    const { label, variables } = data;

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
                {variables.map((variable) => {
                    const variableStyles = getNodeStyles(
                        { isEvaluating: variable.isEvaluating, isAnimating: variable.isAnimating, hasChanged: variable.hasChanged },
                        "flex items-center gap-3 justify-between p-3 rounded-lg transition-all duration-300 cursor-pointer shadow-sm bg-gradient-to-r from-white to-slate-50",
                        true // Enable gradient support
                    );

                    return (
                        <motion.div
                            key={variable.name}
                            className={variableStyles.container}
                            initial={variable.hasChanged ? { opacity: 0 } : false}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, type: "spring" }}
                        >
                            {/* Variable name */}
                            <span className="text-xs font-mono font-semibold text-slate-700">
                                {variable.name}
                            </span>

                            {/* Variable value or pointer */}
                            <div className="flex items-center">
                                {variable.type === 'primitive' ? (
                                    <PrimitiveBox
                                        value={variable.value}
                                        delta={variable.delta}
                                        variableName={variable.name}
                                    />
                                ) : (
                                    <div className="flex items-center gap-1 relative">
                                        <Handle
                                            type="source"
                                            position={Position.Right}
                                            className={getNodeStyles(variable).handle}
                                            id={`${variable.name}-handle`}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// Primitive Variable Node - Shows variable name and value together
export function PrimitiveVariableNode({ data }: { data: PrimitiveVariableNodeData }) {
    const { name, value, delta, variableName, isAnimating, hasChanged, isEvaluating } = data;

    const styles = getNodeStyles(
        { isEvaluating, isAnimating, hasChanged },
        "bg-white border-2 rounded-lg p-2 min-w-[100px] transition-all duration-200 shadow-sm"
    );

    return (
        <motion.div
            className={styles.container}
            initial={hasChanged ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, type: "spring" }}
        >
            {/* Variable name */}
            <div className="text-xs font-mono font-semibold text-slate-700 mb-1 text-center">
                {name}
            </div>

            {/* Value using existing PrimitiveBox */}
            <div className="flex justify-center">
                <PrimitiveBox
                    value={value}
                    delta={delta}
                    variableName={variableName}
                />
            </div>
        </motion.div>
    );
}

// Complex Variable Node - Shows variable name with pointer indicator
export function ComplexVariableNode({ data }: { data: ComplexVariableNodeData }) {
    const { name, isAnimating, hasChanged, isEvaluating } = data;

    const styles = getNodeStyles(
        { isEvaluating, isAnimating, hasChanged },
        "bg-white border-2 rounded-lg p-2 min-w-[80px] transition-all duration-200 shadow-sm"
    );

    return (
        <motion.div
            className={styles.container}
            initial={hasChanged ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, type: "spring" }}
        >
            {/* Variable name */}
            <div className="text-xs font-mono font-semibold text-slate-700 text-center">
                {name}
            </div>

            {/* Handle for outgoing connection */}
            <Handle
                type="source"
                position={Position.Right}
                className={styles.handle}
            />
        </motion.div>
    );
}

// Array Value Node - Shows array contents using ArrayVisualizer
export function ArrayValueNode({ data }: { data: ArrayValueNodeData }) {
    const { value, delta, variableName, isAnimating, hasChanged, isEvaluating } = data;

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

            {/* Array visualizer */}
            <ArrayVisualizer
                values={value}
                delta={delta}
                variableName={variableName}
            />
        </motion.div>
    );
}

// Object Value Node - Shows object contents using DictionaryVisualizer
export function ObjectValueNode({ data }: { data: ObjectValueNodeData }) {
    const { value, delta, variableName, isAnimating, hasChanged, isEvaluating } = data;

    const styles = getNodeStyles(
        { isEvaluating, isAnimating, hasChanged },
        "bg-white border-2 rounded-lg p-3 transition-all duration-200 shadow-sm"
    );

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

            {/* Dictionary visualizer */}
            <DictionaryVisualizer
                dict={value}
                delta={delta}
                variableName={variableName}
            />
        </motion.div>
    );
}

// Export nodeTypes object for React Flow
export const nodeTypes = {
    variablesFrame: VariablesFrameNode,
    primitiveVariable: PrimitiveVariableNode,
    complexVariable: ComplexVariableNode,
    arrayValue: ArrayValueNode,
    objectValue: ObjectValueNode,
};

// Export interfaces for type safety
export type {
    PrimitiveVariableNodeData,
    ComplexVariableNodeData,
    ArrayValueNodeData,
    ObjectValueNodeData,
    VariablesFrameNodeData,
}; 