import 'reactflow/dist/style.css';

import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Background, BackgroundVariant, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow
} from 'reactflow';

import { selectCurrentLine, useTraceStore } from '../../store/traceStore';
import { edgeTypes } from '../flow-nodes/CustomEdges';
import { generateFlowData } from '../flow-nodes/generateFlowData';
import { calculateFitViewOptions, getSmartLayout } from '../flow-nodes/layoutEngine';
import { nodeTypes } from '../flow-nodes/VariablePanelNodes';

// Custom styles for the React Flow
const flowStyles = {
    width: '100%',
    height: '100%',
};

// Inner component that has access to React Flow context
function PythonTutorVariablePanelInner({ resizeTrigger }: { resizeTrigger?: number }) {
    const { fitView } = useReactFlow();

    // Get current trace data and animation states
    const current = useTraceStore(selectCurrentLine);
    const { animatingVariable, isEvaluating, stepIndex, traceData } = useTraceStore();

    // Extract variables from current step
    const variables = current?.locals || {};
    const delta = current?.delta || undefined;

    // Generate nodes and edges from current variables
    const { nodes: generatedNodes, edges: generatedEdges } = useMemo(() => {
        const relationships = traceData?.relationships || [];
        return generateFlowData({
            variables,
            animatingVariable,
            isEvaluating,
            delta,
            stepIndex,
            relationships
        });
    }, [variables, animatingVariable, delta, stepIndex, traceData]);

    // Apply layout to the generated nodes and edges
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
        return getSmartLayout(generatedNodes, generatedEdges);
    }, [generatedNodes, generatedEdges]);

    // State for React Flow
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    // Update nodes and edges when variables change
    useEffect(() => {
        console.log(variables, animatingVariable, isEvaluating, delta, stepIndex, traceData);
        const relationships = traceData?.relationships || [];
        const { nodes: newNodes, edges: newEdges } = generateFlowData({
            variables,
            animatingVariable,
            isEvaluating,
            delta,
            stepIndex,
            relationships
        });

        const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getSmartLayout(
            newNodes,
            newEdges
        );

        setNodes(newLayoutedNodes);
        setEdges(newLayoutedEdges);
    }, [variables, animatingVariable, isEvaluating, delta, stepIndex, traceData]);

    // Fit view when nodes change
    useEffect(() => {
        if (nodes.length > 0) {
            const fitViewOptions = calculateFitViewOptions(nodes);
            setTimeout(() => {
                fitView(fitViewOptions);
            }, 100); // Small delay to ensure nodes are rendered
        }
    }, [nodes, fitView]);

    // Fit view when panel is resized
    useEffect(() => {
        if (resizeTrigger && nodes.length > 0) {
            const fitViewOptions = calculateFitViewOptions(nodes);
            setTimeout(() => {
                fitView(fitViewOptions);
            }, 150); // Slightly longer delay for resize
        }
    }, [resizeTrigger, nodes, fitView]);

    // Handle node click for potential future interactions
    const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
        console.log('Node clicked:', node);
        // Future: Could implement variable selection/focus here
    }, []);

    // Check if we have any variables to display
    const hasVariables = Object.keys(variables).length > 0;

    if (!hasVariables) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <motion.div
                    className="text-center p-8 rounded-xl bg-white shadow-lg border-2 border-slate-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Variables Yet</h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                        Variables will appear here as your Python code executes. Step through your code to see them!
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                style={flowStyles}
                // Read-only interaction settings
                panOnDrag={false}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                edgesUpdatable={false}
                panOnScroll={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                // Keep these settings
                preventScrolling={false}
                minZoom={0.2}
                maxZoom={2}
                defaultEdgeOptions={{
                    style: { strokeWidth: 2 },
                    type: 'smoothstep',
                }}
            >
                {/* Background pattern */}
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="#e2e8f0"
                />
            </ReactFlow>
        </div>
    );
}

// Main component wrapper with React Flow Provider
export function PythonTutorVariablePanel({ resizeTrigger }: { resizeTrigger?: number } = {}) {
    return (
        <motion.div
            className="w-full h-full bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <ReactFlowProvider>
                <PythonTutorVariablePanelInner resizeTrigger={resizeTrigger} />
            </ReactFlowProvider>
        </motion.div>
    );
}

// Export for use in other components
export default PythonTutorVariablePanel; 