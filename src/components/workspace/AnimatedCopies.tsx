import { animate, AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Types for animated copies
export interface AnimatedCopy {
    id: string;
    variableName: string;
    value: any;
    startRect: DOMRect;
    targetRect?: DOMRect;
    targetLambda?: () => DOMRect | undefined;
    isActive: boolean;
}

// Individual animated copy component that tracks its target continuously
interface AnimatedCopyItemProps {
    copy: AnimatedCopy;
}

function AnimatedCopyItem({ copy }: AnimatedCopyItemProps) {
    // For targetLambda, use motion values for continuous tracking
    // For targetRect, use regular motion.div animation
    const left = useMotionValue(copy.startRect.left);
    const top = useMotionValue(copy.startRect.top);
    const width = useMotionValue(copy.startRect.width);
    const height = useMotionValue(copy.startRect.height);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Update target position every 250ms for smooth tracking
        const updateTarget = () => {
            const targetRect = copy.targetLambda?.();
            if (targetRect) {
                animate(left, targetRect.left, {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.4
                });
                animate(top, targetRect.top, {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.4
                });
                animate(width, targetRect.width, {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.4
                });
                animate(height, targetRect.height, {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.4
                });
            }
        };

        // Start tracking after a brief delay
        const timeoutId = setTimeout(() => {
            updateTarget(); // Initial update
            intervalRef.current = setInterval(updateTarget, 250);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [copy.targetLambda, left, top, width, height]);

    if (copy.targetLambda) {
        return (
            <motion.div
                className="fixed pointer-events-none z-[10000] inline-flex px-1 py-0.5 rounded-xl font-mono text-sm bg-purple-200 text-purple-800 items-center justify-center whitespace-nowrap"
                style={{
                    left,
                    top,
                    width,
                    height,
                    transformOrigin: "center center",
                }}
                initial={{
                    opacity: 1,
                    scale: 1,
                }}
                exit={{
                    opacity: 0,
                    scale: 1,
                }}
                transition={{
                    duration: 0.2
                }}
            >
                {typeof copy.value === 'string' ? `"${copy.value}"` : JSON.stringify(copy.value)}
            </motion.div>
        );
    }

    // For static targetRect, use regular motion.div animation
    const targetRect = copy.targetRect!;
    return (
        <motion.div
            className="fixed pointer-events-none z-[10000] inline-flex px-1 py-0.5 rounded font-mono text-sm bg-purple-200 text-purple-800 items-center justify-center whitespace-nowrap"
            initial={{
                left: copy.startRect.left,
                top: copy.startRect.top,
                width: copy.startRect.width,
                height: copy.startRect.height,
                opacity: 1,
                scale: 1,
            }}
            animate={{
                left: targetRect.left,
                top: targetRect.top,
                width: targetRect.width,
                height: targetRect.height,
                opacity: 1,
                scale: 1,
            }}
            exit={{
                opacity: 0,
                scale: 1,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.75,
            }}
            style={{
                transformOrigin: "center center",
            }}
        >
            {typeof copy.value === 'string' ? `"${copy.value}"` : JSON.stringify(copy.value)}
        </motion.div>
    );
}

// Component for rendering animated copies
interface AnimatedCopiesProps {
    animatedCopies: AnimatedCopy[];
}

export function AnimatedCopies({ animatedCopies }: AnimatedCopiesProps) {
    return createPortal(
        <AnimatePresence>
            {animatedCopies.map(copy => {
                if (copy.targetRect === null && copy.targetLambda === undefined) {
                    return null;
                }

                // Quick check if we have a valid target
                let hasValidTarget = false;
                if (copy.targetLambda) {
                    const targetRect = copy.targetLambda();
                    hasValidTarget = targetRect !== undefined;
                } else if (copy.targetRect) {
                    hasValidTarget = true;
                }

                if (!hasValidTarget) {
                    return null;
                }

                return <AnimatedCopyItem key={copy.id} copy={copy} />;
            })}
        </AnimatePresence>,
        document.body
    );
} 