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

    // For nodes that have been evaluated (both leaf and compound), show the value
    if (node.hasValue) {
        const isLeafNode = node.children.length === 1 && typeof node.children[0] === 'string';
        return (
            <motion.span
                key={`node-${node.nodeId}`}
                data-node-id={node.nodeId}
                {...(isLeafNode && { 'data-target': variableName })}
                className={`
                    inline-block px-1 rounded font-mono text-xs lg:text-sm
                    ${isAnimatingThis && isLeafNode
                        ? 'bg-purple-200 text-purple-800 ring-2 ring-purple-300 ring-opacity-50 shadow-lg'
                        : node.isHighlighted
                            ? 'bg-yellow-200 text-yellow-800 ring-2 ring-yellow-400 ring-opacity-70'
                            : 'bg-purple-200 text-purple-800'
                    }
                `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                    opacity: 0,
                    scale: 0.8,
                    transition: {
                        duration: 0.2,
                        ease: "easeInOut"
                    }
                }}
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
                px-1 inline-block items-center justify-center
                ${node.isHighlighted ? 'bg-yellow-100 text-yellow-800 rounded ring-2 ring-yellow-400 ring-opacity-70' : ''}
                ${isAnimatingThis ? 'bg-purple-100 text-purple-700 rounded' : ''}
            `}
        >
            {renderedChildren}
        </span>
    );
} 