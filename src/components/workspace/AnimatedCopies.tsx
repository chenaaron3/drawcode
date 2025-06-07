import { AnimatePresence, motion } from 'framer-motion';
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

// Component for rendering animated copies
interface AnimatedCopiesProps {
    animatedCopies: AnimatedCopy[];
}

export function AnimatedCopies({ animatedCopies }: AnimatedCopiesProps) {
    return createPortal(
        <AnimatePresence>
            {animatedCopies.map(copy => {
                if (copy.targetRect === null && copy.targetLambda === undefined) {
                    return <></>;
                }
                let targetRect = copy.targetRect;
                // Resolve the lambda if it exists
                if (copy.targetLambda !== undefined) {
                    targetRect = copy.targetLambda();
                }
                if (targetRect === undefined) {
                    return <></>;
                }
                return <motion.div
                    key={copy.id}
                    // center the text
                    className="fixed pointer-events-none z-[10000] inline-flex px-1 py-0.5 rounded font-mono text-sm bg-blue-200 text-blue-800 items-center justify-center"
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
            })}
        </AnimatePresence>,
        document.body
    );
} 