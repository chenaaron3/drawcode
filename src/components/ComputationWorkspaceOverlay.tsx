import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef<MutationObserver | null>(null);

    // Function to calculate overlay position
    const calculatePosition = (): OverlayPosition | null => {
        if (!currentLine) return null;

        // Find the current line element in the editor
        const lineElement = document.querySelector(`[data-line-number="${currentLine.line_number}"][data-is-current="true"]`);
        if (!lineElement) return null;

        // Debug logging
        console.log('Line element:', lineElement);
        console.log('Line text content:', lineElement.textContent);
        console.log('Line innerHTML:', lineElement.innerHTML);

        const lineRect = lineElement.getBoundingClientRect();

        // Find the first code content span (skip line numbers)
        let leftOffset = 0;

        // Get all direct child spans
        const childSpans = Array.from(lineElement.children) as HTMLElement[];
        console.log('Child spans:', childSpans.map(span => ({
            className: span.className,
            textContent: span.textContent,
            offsetLeft: span.offsetLeft,
            clientRect: span.getBoundingClientRect()
        })));

        // Find first span that's not a line number
        const firstCodeSpan = childSpans.find(span =>
            !span.classList.contains('linenumber') &&
            !span.classList.contains('react-syntax-highlighter-line-number') &&
            span.textContent?.trim()
        );

        if (firstCodeSpan) {
            const firstCodeRect = firstCodeSpan.getBoundingClientRect();
            leftOffset = firstCodeRect.left - lineRect.left;
            console.log('First code span found:', firstCodeSpan);
            console.log('First code span rect:', firstCodeRect);
            console.log('Line rect:', lineRect);
            console.log('Left offset calculated:', leftOffset);

            // If the span contains leading whitespace, calculate where the actual text starts
            const spanText = firstCodeSpan.textContent || '';
            const leadingWhitespace = spanText.match(/^(\s*)/)?.[1] || '';

            if (leadingWhitespace.length > 0) {
                // Create a temporary element to measure the whitespace within this span
                const tempElement = document.createElement('span');
                tempElement.style.cssText = firstCodeSpan.style.cssText;
                tempElement.style.position = 'absolute';
                tempElement.style.visibility = 'hidden';
                tempElement.style.whiteSpace = 'pre';
                tempElement.textContent = leadingWhitespace;

                // Copy computed styles
                const spanStyles = window.getComputedStyle(firstCodeSpan);
                tempElement.style.fontFamily = spanStyles.fontFamily;
                tempElement.style.fontSize = spanStyles.fontSize;
                tempElement.style.fontWeight = spanStyles.fontWeight;
                tempElement.style.lineHeight = spanStyles.lineHeight;
                tempElement.style.letterSpacing = spanStyles.letterSpacing;

                document.body.appendChild(tempElement);
                const whitespaceWidth = tempElement.getBoundingClientRect().width;
                document.body.removeChild(tempElement);

                leftOffset += whitespaceWidth;
                console.log('Added whitespace offset:', whitespaceWidth, 'total offset:', leftOffset);
            }
        } else {
            console.log('No code span found, using fallback');
            // Fallback: measure leading whitespace manually
            const lineText = lineElement.textContent || '';
            // Remove line number from the text
            const lineTextWithoutNumber = lineText.replace(/^\d+\s*/, '');
            const match = lineTextWithoutNumber.match(/^(\s*)/);
            const leadingWhitespace = match ? match[1] : '';

            if (leadingWhitespace.length > 0) {
                const lineStyles = window.getComputedStyle(lineElement);
                const fontSize = parseFloat(lineStyles.fontSize);
                const charWidth = fontSize * 0.6;
                leftOffset = leadingWhitespace.length * charWidth;
                console.log('Fallback whitespace measurement:', leadingWhitespace.length, 'chars =', leftOffset, 'px');
            }
        }

        // Calculate the width of the remaining content
        const contentWidth = Math.max(200, lineRect.width - leftOffset); // Minimum width

        console.log('Final position:', {
            top: lineRect.top,
            left: lineRect.left + leftOffset,
            width: contentWidth,
            height: lineRect.height,
            leftOffset
        });

        // Position overlay to start where the actual code begins
        return {
            top: lineRect.top,
            left: lineRect.left + leftOffset,
            width: contentWidth,
            height: lineRect.height
        };
    };

    // Update position when current line changes
    useEffect(() => {
        const updatePosition = () => {
            const newPosition = calculatePosition();
            setPosition(newPosition);
            setIsVisible(!!newPosition);
        };

        // Initial position calculation
        updatePosition();

        // Recalculate on scroll or resize
        const handleResize = () => updatePosition();
        const handleScroll = () => updatePosition();

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true); // Capture scroll events

        // Watch for DOM changes (like syntax highlighter re-renders)
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

    // Don't render if overlay mode is disabled, no position, or not visible
    if (!isOverlayMode || !position || !isVisible) {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed z-50 pointer-events-none"
                style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    height: position.height,
                }}
            >
                {/* Full workspace in overlay mode */}
                <div className="pointer-events-auto overflow-hidden h-full">
                    <ComputationWorkspace overlayMode={true} />
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
} 