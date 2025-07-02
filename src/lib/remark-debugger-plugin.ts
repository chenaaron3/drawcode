import { visit } from 'unist-util-visit';

import type { Node, Parent } from "unist";
import type { Text, Code } from "mdast";

// Regex to match 'trace-id=some-id' in the code block info string
const traceIdRegex = /trace-id=([\w-]+)/;

export const remarkDebuggerPlugin = () => {
  return (tree: Node) => {
    visit(
      tree,
      "code",
      (codeNode: Code, index: number, parent: Parent | undefined) => {
        if (!parent) return;
        if (
          codeNode.lang === "python" &&
          codeNode.meta &&
          traceIdRegex.test(codeNode.meta)
        ) {
          const match = codeNode.meta.match(traceIdRegex);
          if (match) {
            const traceId = match[1];
            const problemId = traceId;
            // Replace the code block with a debugger node
            const debuggerNode: Node = {
              type: "debugger",
              data: {
                hName: "debuggerviewtrigger",
                hProperties: { problemId },
              },
            };
            parent.children.splice(index + 1, 0, debuggerNode);
          }
        }
      },
    );
  };
};
