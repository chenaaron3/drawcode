import 'reactflow/dist/style.css';

import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    Background, BackgroundVariant, Controls, Panel, ReactFlowProvider, useEdgesState, useNodesState,
    useReactFlow
} from 'reactflow';

import { selectCurrentLine, useTraceStore } from '../store/traceStore';
import { edgeTypes } from './flow-nodes/CustomEdges';
import { generateFlowData } from './flow-nodes/generateFlowData';
import { calculateFitViewOptions, getSmartLayout } from './flow-nodes/layoutEngine';
import { nodeTypes } from './flow-nodes/VariablePanelNodes';

// Custom styles for the React Flow
const flowStyles = {
    background: '#fafafa',
    width: '100%',
    height: '100%',
};

// Inner component that has access to React Flow context
function PythonTutorVariablePanelInner() {
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
    }, [variables, animatingVariable, isEvaluating, delta, stepIndex, traceData, setNodes, setEdges]);

    // Fit view when nodes change
    useEffect(() => {
        if (nodes.length > 0) {
            const fitViewOptions = calculateFitViewOptions(nodes);
            setTimeout(() => {
                fitView(fitViewOptions);
            }, 100); // Small delay to ensure nodes are rendered
        }
    }, [nodes, fitView]);

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
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                panOnScroll={true}
                panOnScrollSpeed={0.5}
                zoomOnScroll={true}
                zoomOnPinch={true}
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

                {/* Enhanced Controls for zoom/pan */}
                <Controls
                    position="top-left"
                    showZoom={true}
                    showFitView={true}
                    showInteractive={false}
                    style={{
                        backgroundColor: 'white',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        padding: '4px',
                    }}
                />


                {/* Enhanced Panel for step info */}
                <Panel position="bottom-center">
                    <motion.div
                        className="bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-300 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        role="status"
                        aria-live="polite"
                        aria-label={`Step ${stepIndex + 1} with ${Object.keys(variables).length} variables${animatingVariable ? `, currently animating ${animatingVariable}` : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true"></div>
                                <span className="text-sm font-semibold text-slate-700">
                                    Step {stepIndex + 1}
                                </span>
                            </div>
                            <div className="w-px h-4 bg-slate-300" aria-hidden="true"></div>
                            <span className="text-sm text-slate-600">
                                {Object.keys(variables).length} variables
                            </span>
                            {animatingVariable && (
                                <>
                                    <div className="w-px h-4 bg-slate-300" aria-hidden="true"></div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" aria-hidden="true"></div>
                                        <span className="text-xs font-mono text-orange-600">
                                            {animatingVariable}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </Panel>


            </ReactFlow>
        </div>
    );
}

// Main component wrapper with React Flow Provider
export function PythonTutorVariablePanel() {
    return (
        <motion.div
            className="w-full h-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <ReactFlowProvider>
                <PythonTutorVariablePanelInner />
            </ReactFlowProvider>
        </motion.div>
    );
}

// Export for use in other components
export default PythonTutorVariablePanel; 