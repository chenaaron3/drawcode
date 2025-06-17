import 'reactflow/dist/style.css';

import dagre from 'dagre';
import { CheckCircle } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
    addEdge, Background, Controls, Handle, MarkerType, Panel, Position, ReactFlowProvider,
    useEdgesState, useNodesState
} from 'reactflow';

import { useProgress } from '../../hooks/useProgress';
import { useTraceStore } from '../../store/traceStore';
import { ProblemsPanel } from '../panels';

import type { Connection, Edge, Node, NodeTypes } from 'reactflow';

interface Pattern {
    id: string;
    name: string;
    description: string;
    problemIds: string[];
    dependencies: string[];
    difficulty: string;
    estimatedHours: number;
}

interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    number?: number;
}

interface RoadmapGraphProps {
    patterns: Pattern[];
    problems?: Problem[];
    onProblemClick?: (problemId: string) => void;
    onProblemToggleCompletion?: (problemId: string) => void;
}

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TD', nodesep: 30, ranksep: 60 });

    nodes.forEach((node) => {
        const width = node.type === 'patternNode' ? 180 : 160;
        const height = node.type === 'patternNode' ? 60 : 60;
        dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const width = node.type === 'patternNode' ? 180 : 160;
        const height = node.type === 'patternNode' ? 60 : 60;

        return {
            ...node,
            position: {
                x: nodeWithPosition.x - width / 2,
                y: nodeWithPosition.y - height / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

interface PatternNodeData extends Pattern {
    onClick: () => void;
    completionPercentage: number;
    isCompleted: boolean;
    isSelected: boolean;
}

const PatternNode = ({ data }: { data: PatternNodeData }) => {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-50 border-green-300 text-green-800';
            case 'intermediate':
                return 'bg-yellow-50 border-yellow-300 text-yellow-800';
            case 'advanced':
                return 'bg-red-50 border-red-300 text-red-800';
            default:
                return 'bg-gray-50 border-gray-300 text-gray-800';
        }
    };

    return (
        <div className="relative">
            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-gray-400 border-2 border-white"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-gray-400 border-2 border-white"
            />

            {/* Main Pattern Node */}
            <div
                className={`px-4 py-3 rounded-lg border-2 min-w-[180px] cursor-pointer transition-all hover:shadow-lg ${getDifficultyColor(data.difficulty)} ${data.isSelected ? 'ring-2 ring-blue-400' : ''} ${data.isCompleted ? 'ring-2 ring-green-400' : ''}`}
                onClick={data.onClick}
            >
                <div className="flex items-center justify-center gap-2">
                    <div className="font-semibold text-sm text-center">{data.name}</div>
                    {data.isCompleted && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                </div>
            </div>
        </div>
    );
};

const nodeTypes: NodeTypes = {
    patternNode: PatternNode,
};

const RoadmapGraphInner: React.FC<RoadmapGraphProps> = ({ patterns, problems = [], onProblemClick, onProblemToggleCompletion }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
    const { setCurrentProblem } = useTraceStore();
    const { getPatternCompletion, toggleProblemCompletion } = useProgress();

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const togglePatternSelection = useCallback((pattern: Pattern) => {
        setSelectedPattern(prev => prev?.id === pattern.id ? null : pattern);
    }, []);

    const handleProblemClick = useCallback((problemId: string) => {
        if (onProblemClick) {
            onProblemClick(problemId);
        } else {
            setCurrentProblem(problemId);
        }
    }, [onProblemClick, setCurrentProblem]);

    const handleProblemToggleCompletion = useCallback((problemId: string) => {
        if (onProblemToggleCompletion) {
            onProblemToggleCompletion(problemId);
        } else {
            toggleProblemCompletion(problemId);
        }
    }, [onProblemToggleCompletion, toggleProblemCompletion]);

    const { graphNodes, graphEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Create pattern nodes only (problems are now in side panel)
        patterns.forEach((pattern) => {
            const completionPercentage = getPatternCompletion(pattern.problemIds);
            const isCompleted = completionPercentage === 100;
            const isSelected = selectedPattern?.id === pattern.id;

            nodes.push({
                id: pattern.id,
                type: 'patternNode',
                position: { x: 0, y: 0 }, // Will be set by dagre layout
                data: {
                    ...pattern,
                    completionPercentage,
                    isCompleted,
                    isSelected,
                    onClick: () => togglePatternSelection(pattern),
                },
            });
        });

        // Create edges for pattern dependencies only
        patterns.forEach((pattern) => {
            pattern.dependencies.forEach((depId) => {
                edges.push({
                    id: `${depId}-${pattern.id}`,
                    source: depId,
                    target: pattern.id,
                    type: 'smoothstep',
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20,
                        color: '#374151',
                    },
                    style: {
                        strokeWidth: 1.5,
                        stroke: '#374151',
                    },
                });
            });
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
        return { graphNodes: layoutedNodes, graphEdges: layoutedEdges };
    }, [patterns, problems, selectedPattern, getPatternCompletion, togglePatternSelection]);

    useEffect(() => {
        setNodes(graphNodes);
        setEdges(graphEdges);
    }, [graphNodes, graphEdges, setNodes, setEdges]);

    return (
        <div style={{ height: 'calc(100vh - 80px)', width: '100%' }} className="bg-background">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                fitView
                fitViewOptions={{
                    padding: 0.1,
                    includeHiddenNodes: false,
                    minZoom: 0.3,
                    maxZoom: 1.2
                }}
                attributionPosition="bottom-right"
                proOptions={{ hideAttribution: true }}
                minZoom={0.3}
                maxZoom={2.0}
                defaultViewport={{ x: -100, y: 0, zoom: 0.8 }}
            >
                <Background color="#f8fafc" gap={20} />
                <Controls
                    className="bg-white border border-gray-200 rounded-lg shadow-sm"
                    showInteractive={false}
                />

                {/* Unified Problems Panel - Always visible */}
                <Panel position="top-right" className="m-4">
                    <ProblemsPanel
                        selectedPattern={selectedPattern}
                        problems={problems}
                        onClearFilter={() => setSelectedPattern(null)}
                        onProblemClick={handleProblemClick}
                        onProblemToggleCompletion={handleProblemToggleCompletion}
                    />
                </Panel>
            </ReactFlow>
        </div>
    );
};

const RoadmapGraph: React.FC<RoadmapGraphProps> = ({ patterns, problems, onProblemClick, onProblemToggleCompletion }) => {
    return (
        <ReactFlowProvider>
            <RoadmapGraphInner
                patterns={patterns}
                problems={problems}
                onProblemClick={onProblemClick}
                onProblemToggleCompletion={onProblemToggleCompletion}
            />
        </ReactFlowProvider>
    );
};

export default RoadmapGraph; 