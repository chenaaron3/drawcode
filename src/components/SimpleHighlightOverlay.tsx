import type { ASTLocation } from '@/types/ast';
import React, { useEffect, useRef, useState } from 'react';

interface SimpleHighlightOverlayProps {
    currentLineNumber: number;
    location?: ASTLocation;
    code: string;
}

export function SimpleHighlightOverlay({
    currentLineNumber,
    location,
    code
}: SimpleHighlightOverlayProps) {
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!location || !overlayRef.current) {
            setHighlightStyle(null);
            return;
        }

        // Find the current line element using the data attribute
        const currentLineElement = document.querySelector(`[data-line-number="${currentLineNumber}"][data-is-current="true"]`) as HTMLElement;

        if (!currentLineElement) {
            setHighlightStyle(null);
            return;
        }

        // Get the line text
        const lineText = code.split('\n')[currentLineNumber - 1] || '';

        // Check if this is a multi-line statement using AST location
        const isMultiLineStatement = location.lineno !== location.end_lineno;

        // Get the position of the line element
        const lineRect = currentLineElement.getBoundingClientRect();
        const overlayRect = overlayRef.current.getBoundingClientRect();

        // Find the line number element to account for its width
        const lineNumberElement = currentLineElement.querySelector('span') ||
            currentLineElement.previousElementSibling?.querySelector('span');
        const lineNumberWidth = lineNumberElement ? lineNumberElement.offsetWidth + 16 : 56; // fallback

        if (isMultiLineStatement) {
            // Highlight only the text content for multi-line statements, starting from col_offset
            // Create a temporary element to measure text widths
            const measureElement = document.createElement('span');
            const computedStyle = getComputedStyle(currentLineElement);

            // Copy all relevant styles from the actual line element
            measureElement.style.fontFamily = computedStyle.fontFamily;
            measureElement.style.fontSize = computedStyle.fontSize;
            measureElement.style.fontWeight = computedStyle.fontWeight;
            measureElement.style.letterSpacing = computedStyle.letterSpacing;
            measureElement.style.wordSpacing = computedStyle.wordSpacing;
            measureElement.style.visibility = 'hidden';
            measureElement.style.position = 'absolute';
            measureElement.style.whiteSpace = 'pre';
            measureElement.style.top = '-9999px';
            measureElement.style.left = '-9999px';

            // Measure text before the statement starts
            const textBefore = lineText.slice(0, location.col_offset);
            measureElement.textContent = textBefore;
            document.body.appendChild(measureElement);
            const textBeforeWidth = measureElement.getBoundingClientRect().width;

            // Measure the text from col_offset to end of line
            const textFromStatement = lineText.slice(location.col_offset);
            measureElement.textContent = textFromStatement;
            const statementTextWidth = measureElement.getBoundingClientRect().width;

            document.body.removeChild(measureElement);

            setHighlightStyle({
                position: 'absolute',
                top: lineRect.top - overlayRect.top,
                left: lineNumberWidth + textBeforeWidth + 2,
                width: statementTextWidth + 4,
                height: lineRect.height,
                backgroundColor: 'rgba(254, 240, 138, 0.3)',
                borderRadius: '2px',
                pointerEvents: 'none',
                zIndex: 10,
            });
        } else {
            // Use precise character-level highlighting for single-line expressions
            const highlightStart = location.col_offset;
            const highlightEnd = location.end_col_offset;
            const textBefore = lineText.slice(0, highlightStart);
            const highlightTextContent = lineText.slice(highlightStart, highlightEnd);

            // Create a temporary element to measure text width
            const measureElement = document.createElement('span');
            const computedStyle = getComputedStyle(currentLineElement);

            // Copy all relevant styles from the actual line element
            measureElement.style.fontFamily = computedStyle.fontFamily;
            measureElement.style.fontSize = computedStyle.fontSize;
            measureElement.style.fontWeight = computedStyle.fontWeight;
            measureElement.style.letterSpacing = computedStyle.letterSpacing;
            measureElement.style.wordSpacing = computedStyle.wordSpacing;
            measureElement.style.visibility = 'hidden';
            measureElement.style.position = 'absolute';
            measureElement.style.whiteSpace = 'pre';
            measureElement.style.top = '-9999px';
            measureElement.style.left = '-9999px';

            // Measure text before highlight
            measureElement.textContent = textBefore;
            document.body.appendChild(measureElement);
            const textBeforeWidth = measureElement.getBoundingClientRect().width;

            // Measure highlight text
            measureElement.textContent = highlightTextContent;
            const highlightWidth = measureElement.getBoundingClientRect().width;

            document.body.removeChild(measureElement);

            setHighlightStyle({
                position: 'absolute',
                top: lineRect.top - overlayRect.top,
                left: lineNumberWidth + textBeforeWidth + 2,
                width: highlightWidth + 4,
                height: lineRect.height,
                backgroundColor: 'rgba(254, 240, 138, 0.3)',
                borderRadius: '2px',
                pointerEvents: 'none',
                zIndex: 10,
            });
        }

    }, [currentLineNumber, location, code]);

    return (
        <div
            ref={overlayRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 5,
            }}
        >
            {highlightStyle && (
                <div style={highlightStyle} />
            )}
        </div>
    );
} 