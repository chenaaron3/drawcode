import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

// Types for animated copies
export interface AnimatedCopy {
    id: string;
    variableName: string;
    value: any;
    startRect: DOMRect;
    targetRect: DOMRect;
    isActive: boolean;
}

// Component for rendering animated copies
interface AnimatedCopiesProps {
    animatedCopies: AnimatedCopy[];
}

export function AnimatedCopies({ animatedCopies }: AnimatedCopiesProps) {
    return createPortal(
        <AnimatePresence>
            {animatedCopies.map(copy => (
                <motion.div
                    key={copy.id}
                    className="fixed pointer-events-none z-[10000] inline-block px-1 py-0.5 rounded font-mono text-sm bg-blue-200 text-blue-800"
                    initial={{
                        left: copy.startRect.left,
                        top: copy.startRect.top,
                        width: copy.startRect.width,
                        height: copy.startRect.height,
                        opacity: 1,
                        scale: 1,
                    }}
                    animate={{
                        left: copy.targetRect.left,
                        top: copy.targetRect.top,
                        width: copy.targetRect.width,
                        height: copy.targetRect.height,
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
                        duration: 0.6,
                    }}
                    style={{
                        transformOrigin: "center center",
                    }}
                >
                    {typeof copy.value === 'string' ? `"${copy.value}"` : JSON.stringify(copy.value)}
                </motion.div>
            ))}
        </AnimatePresence>,
        document.body
    );
} 