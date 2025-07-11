// Pure utility functions for evaluation tree manipulation

export interface EvaluationNode {
  nodeId: number;
  value?: any;
  hasValue: boolean;
  children: (string | EvaluationNode)[];
  isHighlighted: boolean;
  offset: number; // Start position of this node in the original line
}

export function getNodeTextLength(node: EvaluationNode): number {
  return node.children.reduce((length, child) => {
    if (typeof child === "string") {
      return length + child.length;
    } else {
      return length + getNodeTextLength(child);
    }
  }, 0);
}

export function replaceNodeValueInTree(
  tree: EvaluationNode,
  targetNodeId: number,
  value: any,
): EvaluationNode {
  if (tree.nodeId === targetNodeId) {
    return {
      ...tree,
      value,
      hasValue: true,
      // Keep original children to preserve structure
    };
  }

  return {
    ...tree,
    children: tree.children.map((child) =>
      typeof child === "string"
        ? child
        : replaceNodeValueInTree(child, targetNodeId, value),
    ),
  };
}

export function highlightNodeInTree(
  tree: EvaluationNode,
  targetNodeId: number,
  highlight: boolean,
): EvaluationNode {
  const clearAllHighlights = (node: EvaluationNode): EvaluationNode => ({
    ...node,
    isHighlighted: false,
    children: node.children.map((child) =>
      typeof child === "string" ? child : clearAllHighlights(child),
    ),
  });

  // First clear all highlights
  let newTree = clearAllHighlights(tree);

  // Then set the specific highlight if needed
  if (highlight) {
    const setHighlight = (node: EvaluationNode): EvaluationNode => ({
      ...node,
      isHighlighted: node.nodeId === targetNodeId,
      children: node.children.map((child) =>
        typeof child === "string" ? child : setHighlight(child),
      ),
    });
    newTree = setHighlight(newTree);
  }

  return newTree;
}
