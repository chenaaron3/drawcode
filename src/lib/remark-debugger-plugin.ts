import { visit } from 'unist-util-visit';

import type { Node, Parent } from "unist";
import type { Text, Code } from "mdast";

// Regex to match 'trace-id=some-id' in the code block info string
const traceIdRegex = /trace-id=([\w-]+)/;

export const remarkDebuggerPlugin = () => {
  return (tree: Node, file?: { path?: string }) => {
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
            // Get the blog slug from the file path if available
            let blogSlug = "";
            console.log("FILE", file, file?.path);
            if (file && file.path) {
              const parts = file.path.split("/");
              const filename = parts[parts.length - 1];
              if (filename) {
                blogSlug = filename.replace(/\.[^.]+$/, ""); // remove extension
              }
            }
            const traceId = match[1];
            const problemId = blogSlug ? `${blogSlug}_${traceId}` : traceId;
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
