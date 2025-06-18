import dagre from 'dagre';

import type { Node, Edge } from "reactflow";

// Layout configuration
interface LayoutConfig {
  direction: "TB" | "BT" | "LR" | "RL";
  nodeWidth: number;
  nodeHeight: number;
  rankSeparation: number;
  nodeSeparation: number;
  edgeSeparation: number;
}

// Default layout configuration optimized for variable visualization
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  direction: "LR", // Left to Right for Python Tutor style
  nodeWidth: 150,
  nodeHeight: 80,
  rankSeparation: 250, // Space between variable and value columns
  nodeSeparation: 30, // Space between nodes in same column
  edgeSeparation: 10, // Space between parallel edges
};

// Node type specific configurations
const NODE_TYPE_CONFIGS = {
  variablesFrame: { width: 120, height: 50 },
  primitiveVariable: { width: 140, height: 70 },
  complexVariable: { width: 120, height: 60 },
  arrayValue: { width: 200, height: 100 },
  objectValue: { width: 180, height: 120 },
};

/**
 * Get the appropriate width and height for a node based on its type and content
 */
function getNodeDimensions(node: Node): { width: number; height: number } {
  const baseConfig = NODE_TYPE_CONFIGS[
    node.type as keyof typeof NODE_TYPE_CONFIGS
  ] || {
    width: DEFAULT_LAYOUT_CONFIG.nodeWidth,
    height: DEFAULT_LAYOUT_CONFIG.nodeHeight,
  };

  // Adjust dimensions based on content for better visualization
  if (node.type === "arrayValue") {
    const arrayLength = node.data?.value?.length || 0;
    // Wider arrays need more space
    const extraWidth = Math.min(arrayLength * 15, 100);
    return {
      width: baseConfig.width + extraWidth,
      height: baseConfig.height,
    };
  }

  if (node.type === "objectValue") {
    const objectKeys = Object.keys(node.data?.value || {}).length;
    // More properties need more height
    const extraHeight = Math.min(objectKeys * 15, 60);
    return {
      width: baseConfig.width,
      height: baseConfig.height + extraHeight,
    };
  }

  if (node.type === "primitiveVariable") {
    const valueLength = String(node.data?.value || "").length;
    // Longer values need more width
    const extraWidth = Math.min(valueLength * 3, 50);
    return {
      width: baseConfig.width + extraWidth,
      height: baseConfig.height,
    };
  }

  return baseConfig;
}

/**
 * Create a dagre graph with Python Tutor-style layout
 */
function createDagreGraph(config: LayoutConfig): dagre.graphlib.Graph {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: config.direction,
    ranksep: config.rankSeparation,
    nodesep: config.nodeSeparation,
    edgesep: config.edgeSeparation,
    marginx: 20,
    marginy: 20,
  });

  return dagreGraph;
}

/**
 * Apply custom positioning logic for Python Tutor style
 */
function applyCustomPositioning(nodes: Node[]): Node[] {
  // const frameNodes = nodes.filter((n) => n.type === "variablesFrame");
  const valueNodes = nodes.filter(
    (n) => n.type === "arrayValue" || n.type === "objectValue",
  );

  // Variables frame positioning
  const frameStartX = 50;
  const frameStartY = 50;

  // Values column - start at same Y as frame with minimal X offset
  const valueStartX = 400;
  const minValueSpacing = 120; // Minimum vertical spacing between value nodes

  // Track used Y positions to avoid overlaps
  const usedYPositions: number[] = [];

  return nodes.map((node) => {
    if (node.type === "variablesFrame") {
      return {
        ...node,
        position: { x: frameStartX, y: frameStartY },
      };
    }

    if (node.type === "arrayValue" || node.type === "objectValue") {
      const valueIndex = valueNodes.findIndex((n) => n.id === node.id);

      // Try to align with the frame first (straight line)
      let targetY = frameStartY;

      // Check if this Y position is already used
      let finalY = targetY;
      let attempts = 0;

      while (
        usedYPositions.some(
          (usedY) => Math.abs(usedY - finalY) < minValueSpacing,
        ) &&
        attempts < 10
      ) {
        finalY = targetY + (attempts + 1) * minValueSpacing;
        attempts++;
      }

      // If we still have conflicts, use index-based positioning as fallback
      if (attempts >= 10) {
        finalY = frameStartY + valueIndex * minValueSpacing;
      }

      usedYPositions.push(finalY);

      return {
        ...node,
        position: {
          x: valueStartX,
          y: finalY,
        },
      };
    }

    return node;
  });
}

/**
 * Main function to apply automatic layout to nodes and edges
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  _config: Partial<LayoutConfig> = {},
): { nodes: Node[]; edges: Edge[] } {
  // const layoutConfig = { ...DEFAULT_LAYOUT_CONFIG, ...config };

  // For Python Tutor style, we'll use a custom positioning approach
  // rather than pure dagre auto-layout for better control
  if (nodes.length === 0) {
    return { nodes, edges };
  }

  // Apply custom Python Tutor-style positioning
  const layoutedNodes = applyCustomPositioning(nodes);

  return {
    nodes: layoutedNodes,
    edges: edges,
  };
}

/**
 * Alternative dagre-based layout for complex scenarios
 */
export function getDagreLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {},
): { nodes: Node[]; edges: Edge[] } {
  const layoutConfig = { ...DEFAULT_LAYOUT_CONFIG, ...config };
  const dagreGraph = createDagreGraph(layoutConfig);

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    const dimensions = getNodeDimensions(node);
    dagreGraph.setNode(node.id, dimensions);
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const dimensions = getNodeDimensions(node);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - dimensions.width / 2,
        y: nodeWithPosition.y - dimensions.height / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges: edges,
  };
}

/**
 * Smart layout that chooses between custom and dagre based on complexity
 */
export function getSmartLayout(
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {},
): { nodes: Node[]; edges: Edge[] } {
  // Use custom layout for simple cases (typical variable visualization)
  // Use dagre for complex cases with many relationships

  const complexDataNodes = nodes.filter(
    (n) => n.type === "arrayValue" || n.type === "objectValue",
  ).length;

  const totalEdges = edges.length;

  // If we have many complex data structures or many edges, use dagre
  if (complexDataNodes > 5 || totalEdges > 8) {
    return getDagreLayoutedElements(nodes, edges, config);
  }

  // Otherwise use our custom Python Tutor-style layout
  return getLayoutedElements(nodes, edges, config);
}

/**
 * Utility function to fit view after layout
 */
export function calculateFitViewOptions(nodes: Node[]) {
  if (nodes.length === 0) {
    return { padding: 0.1 };
  }

  // Calculate bounds
  const minX = Math.min(...nodes.map((n) => n.position.x));
  const maxX = Math.max(...nodes.map((n) => n.position.x + 150)); // Approximate node width
  const minY = Math.min(...nodes.map((n) => n.position.y));
  const maxY = Math.max(...nodes.map((n) => n.position.y + 80)); // Approximate node height

  const width = maxX - minX;
  const height = maxY - minY;

  // Add padding based on content size
  const padding = Math.min(0.2, 100 / Math.max(width, height));

  return { padding };
}

// Export types and configurations
export type { LayoutConfig };
export { DEFAULT_LAYOUT_CONFIG, NODE_TYPE_CONFIGS };
