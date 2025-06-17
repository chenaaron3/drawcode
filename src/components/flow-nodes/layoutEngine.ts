// --- Simple Python Tutor–Style Layout Engine ---
// Adjustable layout parameters
const frameStartX = 50;
const frameStartY = 50;
const framePadding = 20;
const variableVerticalMargin = 16;
const valueColumnOffset = 300; // Horizontal distance from frame to value column
const valueVerticalMargin = 24;
const containerPadding = 20;

import type { Node, Edge } from "reactflow";

// Helper: get node dimensions (width/height)
function getNodeDimensions(node: Node): { width: number; height: number } {
  // You can adjust these as needed or make them dynamic
  if (node.type === "variablesFrame") return { width: 120, height: 50 };
  if (node.type === "primitiveVariable") return { width: 140, height: 70 };
  if (node.type === "complexVariable") return { width: 120, height: 60 };
  if (node.type === "arrayValue") {
    const arrayLength = node.data?.value?.length || 0;
    return { width: 120 + arrayLength * 40, height: 100 };
  }
  if (node.type === "objectValue") return { width: 180, height: 120 };
  return { width: 150, height: 80 };
}

/**
 * Main layout function for Python Tutor–style visualization
 * - Variables frame on the left
 * - Variable nodes stacked vertically inside frame
 * - Value nodes (objects/arrays) stacked vertically in a column to the right
 * - No node overlap, configurable margins
 */
export function getPythonTutorLayout(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  // Identify node types
  const frameNode = nodes.find((n) => n.type === "variablesFrame");
  const variableNodes = nodes.filter(
    (n) => n.type === "primitiveVariable" || n.type === "complexVariable"
  );
  const valueNodes = nodes.filter(
    (n) => n.type === "arrayValue" || n.type === "objectValue"
  );

  // --- 1. Place the frame node ---
  let layoutedNodes: Node[] = [];
  let frameHeight = 0;
  if (frameNode) {
    // Frame height = sum of variable node heights + margins + padding
    let totalVarHeight = 0;
    variableNodes.forEach((v) => {
      totalVarHeight += getNodeDimensions(v).height;
    });
    const totalVarMargin =
      Math.max(0, variableNodes.length - 1) * variableVerticalMargin;
    frameHeight = totalVarHeight + totalVarMargin + 2 * framePadding;
    layoutedNodes.push({
      ...frameNode,
      position: { x: frameStartX, y: frameStartY },
      data: {
        ...frameNode.data,
        frameHeight,
      },
    });
  }

  // --- 2. Place variable nodes stacked vertically inside frame ---
  let currentVarY = frameStartY + framePadding;
  variableNodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    layoutedNodes.push({
      ...node,
      position: { x: frameStartX + framePadding, y: currentVarY },
      width,
      height,
    });
    currentVarY += height + variableVerticalMargin;
  });

  // --- 3. Place value nodes in a vertical column to the right ---
  let currentValueY = frameStartY + containerPadding;
  valueNodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    layoutedNodes.push({
      ...node,
      position: {
        x: frameStartX + valueColumnOffset,
        y: currentValueY,
      },
      width,
      height,
    });
    currentValueY += height + valueVerticalMargin;
  });

  // --- 4. Return layouted nodes and unchanged edges ---
  return { nodes: layoutedNodes, edges };
}
