import { motion } from 'framer-motion';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

import type { EdgeProps } from 'reactflow';

// Animated Pointer Edge - shows animated flow from variable to value
export function AnimatedPointerEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const isAnimating = data?.isAnimating || false;
    const hasChanged = data?.hasChanged || false;

    // Dynamic styling based on state
    const edgeStyle = {
        ...style,
        stroke: isAnimating ? '#3b82f6' : hasChanged ? '#10b981' : '#64748b',
        strokeDasharray: isAnimating ? '5,5' : 'none',
    };

    const markerEndId = `marker-${id}`;

    return (
        <>
            <BaseEdge
                path={edgePath}
                style={edgeStyle}
                markerEnd={`url(#${markerEndId})`}
            />

            {/* Animated flow indicator */}
            {isAnimating && (
                <EdgeLabelRenderer>
                    <motion.div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'none',
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: [0, 1.2, 1],
                            opacity: [0, 1, 0.8],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatType: 'loop',
                        }}
                    >
                        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg" />
                    </motion.div>
                </EdgeLabelRenderer>
            )}

            {/* Change indicator */}
            {hasChanged && !isAnimating && (
                <EdgeLabelRenderer>
                    <motion.div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'none',
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded border border-green-300 font-mono">
                            ✓
                        </div>
                    </motion.div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

// Highlighted Connection Edge - for when variables are selected/focused
export function HighlightedEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const isHighlighted = data?.isHighlighted || false;

    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Glow effect for highlighted edges */}
            {isHighlighted && (
                <BaseEdge
                    path={edgePath}
                    style={{
                        ...style,
                        stroke: '#fbbf24',
                        opacity: 0.3,
                        filter: 'blur(2px)',
                    }}
                />
            )}

            {/* Main edge */}
            <BaseEdge
                path={edgePath}
                style={{
                    ...style,
                    stroke: isHighlighted ? '#f59e0b' : style.stroke || '#64748b',
                }}
                markerEnd={isHighlighted ? 'url(#highlighted-arrow)' : 'url(#default-arrow)'}
            />
        </motion.g>
    );
}

// Export edge types for React Flow
export const edgeTypes = {
    animatedPointer: AnimatedPointerEdge,
    highlighted: HighlightedEdge,
}; 