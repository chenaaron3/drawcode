import { visit } from 'unist-util-visit';

import type { Node, Parent } from "unist";
import type { Text } from "mdast";

const debuggerRegex = /{{Debugger problemId="([^"]+)"}}/;

export const remarkDebuggerPlugin = () => {
  return (tree: Node) => {
    visit(tree, "paragraph", (paragraphNode: Parent) => {
      // If the paragraph has no children, do nothing
      if (!paragraphNode.children) return;

      const newChildren: Node[] = [];
      let hasDebugger = false;

      paragraphNode.children.forEach((childNode) => {
        if (childNode.type === "text") {
          const textNode = childNode as Text;
          const parts = textNode.value.split(debuggerRegex);

          if (parts.length > 1) {
            hasDebugger = true;
            // The first part is always text before the first match
            if (parts[0])
              newChildren.push({ type: "text", value: parts[0] } as Text);

            // The rest of the parts are [problemId, text, problemId, text, ...]
            for (let i = 1; i < parts.length; i += 2) {
              const problemId = parts[i];
              const followingText = parts[i + 1];

              // Add the debugger component node
              newChildren.push({
                type: "debugger",
                data: {
                  hName: "debuggerviewtrigger",
                  hProperties: { problemId },
                },
              });

              // Add the text that followed the placeholder
              if (followingText) {
                newChildren.push({
                  type: "text",
                  value: followingText,
                } as Text);
              }
            }
          } else {
            // No match, just add the original node
            newChildren.push(childNode);
          }
        } else {
          // Not a text node, just add it
          newChildren.push(childNode);
        }
      });

      // If we found a debugger placeholder, replace the paragraph's children
      if (hasDebugger) {
        paragraphNode.children = newChildren;
      }
    });
  };
};
