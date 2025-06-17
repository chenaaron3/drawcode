import type { VarTable, ObjectTable, ObjectTableEntry } from "@/types/trace";
import type { Node, Edge } from "reactflow";
import { MarkerType } from 'reactflow';

import type { ObjectDescriptor } from "@/types/ObjectDescriptor";

interface GenerateFlowDataParams {
  var_table: VarTable;
  object_table: ObjectTable;
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

// Helper to determine node type for object_table entries
function getNodeType(obj: ObjectTableEntry): string {
  if (obj.type === "list") return "arrayValue";
  if (obj.type === "dict") return "objectValue";
  if (obj.type === "set") return "setValue";
  // Add more as needed
  return "objectValue";
}

// Main function to generate nodes and edges from pointer-aware trace data
export function generateFlowData({
  var_table,
  object_table,
  animatingVariable,
  isEvaluating,
  delta,
  stepIndex = 0,
  relationships = [],
}: GenerateFlowDataParams): FlowData {
  // Debug: Log input tables
  console.log("[generateFlowData] var_table:", var_table);
  console.log("[generateFlowData] object_table:", object_table);

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;
  const renderedObjects = new Set<number>();

  // Helper to get next unique node ID for React Flow
  const getNodeId = () => `node-${nodeId++}`;

  // Layout constants
  const FRAME_START_X = 50;
  const FRAME_START_Y = 50;
  const VALUE_START_X = 400;
  const OBJ_SPACING_X = 350;
  const OBJ_SPACING_Y = 120;

  // Map from object id to React Flow node id
  const objectIdToNodeId: { [key: number]: string } = {};

  // Track y position for object nodes
  let objectNodeCount = 0;

  // Prepare variables for the frame
  const frameVariables: any[] = [];

  // Render object nodes recursively
  function renderObjectNode(objId: number) {
    if (renderedObjects.has(objId)) return;
    renderedObjects.add(objId);
    const obj: ObjectTableEntry | undefined = object_table[objId];
    if (!obj) return;

    // Assign a React Flow node id for this object
    const thisNodeId = getNodeId();
    objectIdToNodeId[objId] = thisNodeId;

    // Positioning: stack horizontally, with vertical offset for each new object
    const x = VALUE_START_X + (objectNodeCount % 3) * OBJ_SPACING_X;
    const y = FRAME_START_Y + Math.floor(objectNodeCount / 3) * OBJ_SPACING_Y;
    objectNodeCount++;

    // Prepare node data
    const nodeType = getNodeType(obj);
    const nodeData: any = {
      value: obj.value,
      objectId: objId,
      type: obj.type,
      mutable: obj.mutable,
    };

    // Find variable name referencing this objectId (if any)
    const variableEntry = Object.entries(var_table).find(
      ([_varName, id]) => id === objId,
    );
    if (
      variableEntry &&
      (nodeType === "arrayValue" || nodeType === "objectValue")
    ) {
      nodeData.variableName = variableEntry[0];
    }

    // For arrays/lists, build values array with ObjectDescriptors
    if (obj.type === "list" && Array.isArray(obj.value)) {
      nodeData.values = (obj.value as number[])
        .map((childId: number, idx: number) => {
          const childObj = object_table[childId];
          if (!childObj) return null;
          const descriptor: ObjectDescriptor = {
            id: childId,
            type: childObj.type,
            value: childObj.mutable ? undefined : childObj.value,
            mutable: childObj.mutable,
          };
          if (childObj.mutable) {
            renderObjectNode(childId);
            edges.push({
              id: `edge-${thisNodeId}-${objectIdToNodeId[childId]}-item-${idx}`,
              source: thisNodeId,
              sourceHandle: `item-${idx}-handle`,
              target: objectIdToNodeId[childId]!,
              type: "smoothstep",
              zIndex: 1000,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#64748b",
                width: 16,
                height: 16,
              },
            });
          }
          return descriptor;
        })
        .filter(Boolean);
    }
    // For dicts, build entries array with key and ObjectDescriptor value
    else if (
      obj.type === "dict" &&
      obj.value &&
      typeof obj.value === "object" &&
      obj.value !== null &&
      !Array.isArray(obj.value)
    ) {
      nodeData.entries = Object.entries(
        obj.value as Record<string, number>,
      ).map(([key, childId]) => {
        const childObj = object_table[childId];
        if (!childObj) return { key, value: null };
        const descriptor: ObjectDescriptor = {
          id: childId,
          type: childObj.type,
          value: childObj.mutable ? undefined : childObj.value,
          mutable: childObj.mutable,
        };
        if (childObj.mutable) {
          renderObjectNode(childId);
          edges.push({
            id: `edge-${thisNodeId}-${objectIdToNodeId[childId]}-key-${key}`,
            source: thisNodeId,
            sourceHandle: `key-${key}-handle`,
            target: objectIdToNodeId[childId]!,
            type: "smoothstep",
            label: key,
            zIndex: 1000,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#64748b",
              width: 16,
              height: 16,
            },
          });
        }
        return { key, value: descriptor };
      });
    }
    // For sets, treat like arrays
    else if (obj.type === "set" && Array.isArray(obj.value)) {
      nodeData.values = (obj.value as number[])
        .map((childId: number, idx: number) => {
          const childObj = object_table[childId];
          if (!childObj) return null;
          const descriptor: ObjectDescriptor = {
            id: childId,
            type: childObj.type,
            value: childObj.mutable ? undefined : childObj.value,
            mutable: childObj.mutable,
          };
          if (childObj.mutable) {
            renderObjectNode(childId);
            edges.push({
              id: `edge-${thisNodeId}-${objectIdToNodeId[childId]}-item-${idx}`,
              source: thisNodeId,
              sourceHandle: `item-${idx}-handle`,
              target: objectIdToNodeId[childId]!,
              type: "smoothstep",
              zIndex: 1000,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#64748b",
                width: 16,
                height: 16,
              },
            });
          }
          return descriptor;
        })
        .filter(Boolean);
    }
    // For custom classes, treat as object with fields
    else if (
      obj.value &&
      typeof obj.value === "object" &&
      obj.value !== null &&
      !Array.isArray(obj.value)
    ) {
      nodeData.fields = Object.entries(obj.value as Record<string, number>).map(
        ([attr, childId]) => {
          const childObj = object_table[childId];
          if (!childObj) return { attr, value: null };
          const descriptor: ObjectDescriptor = {
            id: childId,
            type: childObj.type,
            value: childObj.mutable ? undefined : childObj.value,
            mutable: childObj.mutable,
          };
          if (childObj.mutable) {
            renderObjectNode(childId);
            edges.push({
              id: `edge-${thisNodeId}-${objectIdToNodeId[childId]}`,
              source: thisNodeId,
              target: objectIdToNodeId[childId]!,
              type: "smoothstep",
              label: attr,
              zIndex: 1000,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#64748b",
                width: 16,
                height: 16,
              },
            });
          }
          return { attr, value: descriptor };
        },
      );
    }

    // Debug: Log nodeData for each object node
    console.log(
      `[renderObjectNode] Created node for objId=${objId}:`,
      nodeData,
    );

    nodes.push({
      id: thisNodeId,
      type: nodeType,
      position: { x, y },
      data: nodeData,
      draggable: false,
    });
  }

  // Render variables frame and collect variable nodes/edges
  for (const [varName, objId] of Object.entries(var_table)) {
    const obj: ObjectTableEntry | undefined = object_table[objId];
    // Debug: Log variable processing
    console.log(
      `[generateFlowData] Processing variable '${varName}' (objId=${objId}):`,
      obj,
    );
    if (!obj) continue;

    const isAnimating = animatingVariable === varName;
    const variableDelta = delta?.[varName];
    const hasChanged = variableDelta !== undefined && stepIndex === 0;
    const isEvaluatingThisVar = isEvaluating && isAnimating;
    // Always build the ObjectDescriptor for the variable
    const descriptor: ObjectDescriptor = {
      id: objId,
      type: obj.type,
      value: obj.value,
      mutable: obj.mutable,
    };

    frameVariables.push({
      name: varName,
      value: descriptor,
      delta: variableDelta,
      type: obj.mutable ? "reference" : "primitive",
      objectId: obj.mutable ? objId : undefined,
      isAnimating,
      hasChanged,
      isEvaluating: isEvaluatingThisVar,
    });

    if (obj.mutable) {
      // Render the object node (if not already rendered)
      renderObjectNode(objId);
      // Edge from variable frame to object node
      const frameId = "variables-frame";
      const targetNodeId = objectIdToNodeId[objId]!;
      edges.push({
        id: `edge-${frameId}-${targetNodeId}-${varName}`,
        source: frameId,
        sourceHandle: `${varName}-handle`,
        target: targetNodeId,
        type: "smoothstep",
        animated: isEvaluatingThisVar,
        style: {
          stroke: isEvaluatingThisVar
            ? "#f59e0b"
            : isAnimating
              ? "#8b5cf6"
              : hasChanged
                ? "#10b981"
                : "#64748b",
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
        zIndex: 1000,
      });
    }
  }

  const inUseVariables = Array.from(
    new Set(
      relationships
        .filter((rel) => rel.type === "key_index" || rel.type === "value_index")
        .map((rel) => rel.cursor),
    ),
  );

  // Create the Variables Frame node
  nodes.push({
    id: "variables-frame",
    type: "variablesFrame",
    position: { x: FRAME_START_X, y: FRAME_START_Y },
    data: {
      label: "Variables",
      variables: frameVariables,
      inUseVariables,
    },
    draggable: false,
  });

  // Debug: Log final nodes and edges
  console.log("[generateFlowData] Final nodes:", nodes);
  console.log("[generateFlowData] Final edges:", edges);

  return { nodes, edges };
}

// Export types
export type { GenerateFlowDataParams, FlowData };
