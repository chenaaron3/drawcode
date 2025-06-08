import type { Node, Edge } from "reactflow";
import { MarkerType } from 'reactflow';

// Helper function to determine if a value is primitive
function isPrimitive(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  );
}

// Helper function to determine the type of complex data
function getComplexType(value: any): "array" | "object" {
  return Array.isArray(value) ? "array" : "object";
}

// Interface for the input variables data structure
interface VariablesData {
  [varName: string]: any;
}

interface GenerateFlowDataParams {
  variables: VariablesData;
  animatingVariable: string | null;
  isEvaluating: boolean;
  delta?: { [varName: string]: any };
  stepIndex?: number;
  relationships?: any[];
}

interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

// Helper function to detect cursor variables that should be hidden
function shouldHideCursorVariable(
  varName: string,
  relationships: any[]
): boolean {
  // Check if this variable is used as a cursor in any relationship
  const isCursorInRelationship = relationships.some(
    (rel) =>
      rel.cursor === varName &&
      (rel.type === "key_index" ||
        rel.type === "value_index" ||
        rel.type === "dict_key" ||
        rel.type === "dict_value")
  );

  return isCursorInRelationship; // Hide if it's used as a cursor in relationships
}

// Main function to generate nodes and edges from variables
export function generateFlowData({
  variables,
  animatingVariable,
  isEvaluating,
  delta,
  stepIndex = 0,
  relationships = [],
}: GenerateFlowDataParams): FlowData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;

  // Helper function to get next unique node ID
  const getNodeId = () => `node-${nodeId++}`;

  // Starting positions
  const FRAME_START_X = 50;
  const FRAME_START_Y = 50;
  const VALUE_START_X = 400;
  const VAR_SPACING_Y = 100;

  // Filter variables to exclude cursor variables that are shown in containers
  const filteredVariables = Object.entries(variables).filter(
    ([varName]) => !shouldHideCursorVariable(varName, relationships)
  );

  // Prepare variables data for the frame
  const frameVariables = filteredVariables.map(([varName, value]) => {
    const isAnimating = animatingVariable === varName;
    const variableDelta = delta?.[varName];
    const hasChanged = variableDelta !== undefined && stepIndex === 0;
    const isEvaluatingThisVar = isEvaluating && isAnimating;

    return {
      name: varName,
      value,
      delta: variableDelta,
      type: isPrimitive(value) ? ("primitive" as const) : ("complex" as const),
      complexType: isPrimitive(value) ? undefined : getComplexType(value),
      isAnimating,
      hasChanged,
      isEvaluating: isEvaluatingThisVar,
    };
  });

  // Create the Variables Frame with all variables
  const frameId = getNodeId();
  nodes.push({
    id: frameId,
    type: "variablesFrame",
    position: { x: FRAME_START_X, y: FRAME_START_Y },
    data: {
      label: "Variables",
      variables: frameVariables,
    },
    draggable: false,
  });

  // Process only complex variables that need separate value nodes
  const complexVariables = filteredVariables.filter(
    ([, value]) => !isPrimitive(value)
  );

  complexVariables.forEach(([varName, value], index) => {
    const yPosition = FRAME_START_Y + (index + 1) * VAR_SPACING_Y;

    // Get animation state for this variable
    const isAnimating = animatingVariable === varName;
    const variableDelta = delta?.[varName];
    const hasChanged = variableDelta !== undefined && stepIndex === 0;
    const isEvaluatingThisVar = isEvaluating && isAnimating;

    // Create value node for the complex data
    const valueNodeId = getNodeId();
    const complexType = getComplexType(value);
    const valueNodeType =
      complexType === "array" ? "arrayValue" : "objectValue";

    const valueNodeData = {
      value: value,
      delta: variableDelta,
      variableName: varName,
      isAnimating: isAnimating,
      hasChanged: hasChanged,
      isEvaluating: isEvaluatingThisVar,
    };

    nodes.push({
      id: valueNodeId,
      type: valueNodeType,
      position: { x: VALUE_START_X, y: yPosition },
      data: valueNodeData,
      draggable: false,
    });

    // Create edge connecting variables frame to value
    const edgeId = `edge-${frameId}-${valueNodeId}`;
    edges.push({
      id: edgeId,
      source: frameId,
      sourceHandle: `${varName}-handle`,
      target: valueNodeId,
      type: "smoothstep",
      animated: isEvaluatingThisVar, // Animate only when evaluating, not when animating
      style: {
        stroke: isEvaluatingThisVar
          ? "#f59e0b"
          : isAnimating
          ? "#8b5cf6"
          : hasChanged
          ? "#10b981"
          : "#64748b",
        zIndex: 1000, // Ensure edges appear above nodes
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isEvaluatingThisVar
          ? "#f59e0b"
          : isAnimating
          ? "#8b5cf6"
          : hasChanged
          ? "#10b981"
          : "#64748b",
        width: 20,
        height: 20,
      },
      zIndex: 1000, // Also set at edge level for React Flow
    });
  });

  return { nodes, edges };
}

// Export utility functions for external use
export { isPrimitive, getComplexType };

// Export types
export type { VariablesData, GenerateFlowDataParams, FlowData };
