import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { selectCurrentLine, useTraceStore } from '../store/traceStore';
import ComputationWorkspace from './ComputationWorkspace';

interface OverlayPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

export default function ComputationWorkspaceOverlay() {
    const currentLine = useTraceStore(selectCurrentLine);
    const isOverlayMode = useTraceStore(state => state.isOverlayMode);
    const [position, setPosition] = useState<OverlayPosition | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);

    // Function to calculate overlay position
    const calculatePosition = (): OverlayPosition | null => {
        if (!currentLine) return null;

        // Find the current line element in the editor
        const lineElement = document.querySelector(`[data-line-number="${currentLine.line_number}"][data-is-current="true"]`);
        console.log('Line element:', lineElement);
        if (!lineElement) return null;

        const lineRect = lineElement.getBoundingClientRect();
        const containerRect = lineElement.closest('[data-testid="code-editor-read"]')?.getBoundingClientRect();
        if (!containerRect) return null;

        // Find the first code content span (skip line numbers)
        const childSpans = Array.from(lineElement.children) as HTMLElement[];
        const firstCodeSpan = childSpans.find(span =>
            !span.classList.contains('linenumber') &&
            !span.classList.contains('react-syntax-highlighter-line-number') &&
            span.textContent?.trim()
        );

        let leftOffset = 0;
        if (firstCodeSpan) {
            const firstCodeRect = firstCodeSpan.getBoundingClientRect();
            leftOffset = firstCodeRect.left - lineRect.left;
        }

        // Calculate position relative to the SyntaxHighlighter container
        const contentWidth = Math.max(300, lineRect.width - leftOffset);

        return {
            top: lineRect.top - containerRect.top,
            left: lineRect.left - containerRect.left + leftOffset,
            width: contentWidth,
            height: lineRect.height
        };
    };

    // Update position when current line changes
    useEffect(() => {
        const updatePosition = () => {
            const newPosition = calculatePosition();
            setPosition(newPosition);
        };

        // Initial position calculation after DOM is painted
        const initialUpdate = () => {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                const newPosition = calculatePosition();
                setPosition(newPosition);
            });
        };

        initialUpdate();

        // Recalculate on scroll or resize
        const handleResize = () => updatePosition();
        const handleScroll = () => updatePosition();

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true);

        // Watch for DOM changes
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new MutationObserver(updatePosition);
        const codePanel = document.querySelector('[data-testid="code-editor-read"]');
        if (codePanel) {
            observerRef.current.observe(codePanel, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-is-current']
            });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [currentLine?.line_number]);

    // Don't render if overlay mode is disabled or no position
    if (!isOverlayMode || !position) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute z-40 pointer-events-none"
                style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    height: position.height,
                }}
            >
                <div className="pointer-events-auto overflow-hidden h-full">
                    <ComputationWorkspace overlayMode={true} />
                </div>
            </motion.div>
        </AnimatePresence>
    );
} 