import { motion } from 'framer-motion';

import type { EvaluationNode } from './utils';

// Component for rendering individual evaluation nodes
interface EvaluationNodeProps {
    node: EvaluationNode;
    animatingVariable: string | null;
    currentLocals: Record<string, any> | null;
}

export function EvaluationNodeRenderer({ node, animatingVariable, currentLocals }: EvaluationNodeProps) {
    // Check if this node represents a variable by looking at its original text content
    const getVariableName = (node: EvaluationNode): string | undefined => {
        if (node.children.length === 1 && typeof node.children[0] === 'string') {
            const text = node.children[0];
            if (currentLocals && Object.prototype.hasOwnProperty.call(currentLocals, text)) {
                return text;
            }
        }
        return undefined;
    };

    const variableName = getVariableName(node);
    const isAnimatingThis = animatingVariable === variableName;

    // For leaf nodes (single string child) that have been evaluated, show the value
    if (node.hasValue && node.children.length === 1 && typeof node.children[0] === 'string') {
        return (
            <motion.span
                key={`node-${node.nodeId}`}
                data-node-id={node.nodeId}
                data-target={variableName}
                className={`
                    inline-block px-1 py-0.5 rounded font-mono text-sm
                    ${isAnimatingThis
                        ? 'bg-blue-200 text-blue-800'
                        : node.isHighlighted
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                    }
                `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {typeof node.value === 'string' ? `"${node.value}"` : JSON.stringify(node.value)}
            </motion.span>
        );
    }

    // For compound expressions that have been evaluated, show value with original structure preserved
    if (node.hasValue && node.children.length > 1) {
        return (
            <motion.span
                key={`node-${node.nodeId}`}
                data-node-id={node.nodeId}
                className={`
                    inline-block px-1 py-0.5 rounded font-mono text-sm
                    ${node.isHighlighted
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-blue-200 text-blue-800'
                    }
                `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {typeof node.value === 'string' ? `"${node.value}"` : JSON.stringify(node.value)}
            </motion.span>
        );
    }

    // Render children for nodes without values or compound expressions
    const renderedChildren = node.children.map((child, index) => {
        if (typeof child === 'string') {
            return <span key={`text-${index}`}>{child}</span>;
        } else {
            return (
                <span key={`child-${child.nodeId}`}>
                    <EvaluationNodeRenderer
                        node={child}
                        animatingVariable={animatingVariable}
                        currentLocals={currentLocals}
                    />
                </span>
            );
        }
    });

    return (
        <span
            key={`node-${node.nodeId}`}
            data-node-id={node.nodeId}
            className={`
                ${node.isHighlighted ? 'bg-yellow-100 text-yellow-800 rounded' : ''}
                ${isAnimatingThis ? 'bg-blue-100 text-blue-700 rounded' : ''}
            `}
        >
            {renderedChildren}
        </span>
    );
} 