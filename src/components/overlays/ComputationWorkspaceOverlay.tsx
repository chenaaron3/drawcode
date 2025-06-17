import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { selectCurrentLine, useTraceStore } from '../../store/traceStore';
import { ComputationWorkspace } from '../common';

interface OverlayPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

export default function ComputationWorkspaceOverlay() {
    const currentLine = useTraceStore(selectCurrentLine);
    const [position, setPosition] = useState<OverlayPosition | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);

    // Function to calculate overlay position
    const calculatePosition = (): OverlayPosition | null => {
        if (!currentLine) return null;

        // Find the current line element in the editor
        const lineElement = document.querySelector(`[data-line-number="${currentLine.line_number}"][data-is-current="true"]`);
        if (!lineElement) return null;

        const lineRect = lineElement.getBoundingClientRect();
        const containerRect = lineElement.closest('[data-testid="code-editor-read"]')?.getBoundingClientRect();
        if (!containerRect) return null;

        // Find the second element (after line number) and offset by its leading whitespace
        const childSpans = Array.from(lineElement.children) as HTMLElement[];

        let codeStartX = lineRect.left;

        if (childSpans.length >= 2) {
            const secondSpan = childSpans[1]!; // Skip line number, use second element
            const secondSpanRect = secondSpan.getBoundingClientRect();
            const spanText = secondSpan.textContent || '';
            // Calculate the width of leading whitespace
            const leadingWhitespace = spanText.match(/^(\s*)/)?.[1] || '';

            if (leadingWhitespace.length > 0) {
                // Create a temporary element to measure the whitespace width
                const tempSpan = document.createElement('span');
                tempSpan.style.visibility = 'hidden';
                tempSpan.style.position = 'absolute';
                tempSpan.style.whiteSpace = 'pre'; // Preserve whitespace

                // Copy the font styles from the original span
                const computedStyle = window.getComputedStyle(secondSpan!);
                tempSpan.style.fontFamily = computedStyle.fontFamily;
                tempSpan.style.fontSize = computedStyle.fontSize;
                tempSpan.style.fontWeight = computedStyle.fontWeight;
                tempSpan.style.letterSpacing = computedStyle.letterSpacing;

                tempSpan.textContent = leadingWhitespace;
                document.body.appendChild(tempSpan);

                const whitespaceWidth = tempSpan.getBoundingClientRect().width;
                document.body.removeChild(tempSpan);

                // Position at the second span + whitespace offset
                codeStartX = secondSpanRect.left + whitespaceWidth;
            } else {
                // No leading whitespace, use the span start
                codeStartX = secondSpanRect.left;
            }
        }

        // Calculate position relative to container
        const relativeLeft = codeStartX - containerRect.left;

        // Calculate width based on the last span's right edge
        let contentWidth = 300; // default minimum width
        if (childSpans.length > 0) {
            const lastSpan = childSpans[childSpans.length - 1]!;
            const lastSpanRect = lastSpan.getBoundingClientRect();
            const lineContentWidth = lastSpanRect.right - codeStartX;
            contentWidth = lineContentWidth
        }

        return {
            top: lineRect.top - containerRect.top,
            left: relativeLeft,
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
    }, [currentLine?.line_number, calculatePosition]);

    // Don't render if no position
    if (!position) {
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
                    minWidth: position.width,
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