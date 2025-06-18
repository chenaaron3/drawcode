import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { cn } from '@/lib/utils';

import ComputationWorkspaceOverlay from '../overlays/ComputationWorkspaceOverlay';

interface CodeSyntaxHighlighterProps {
    code: string;
    currentLine?: number;
    className?: string;
    onClick?: () => void;
    showOverlay?: boolean;
}

export function CodeSyntaxHighlighter({
    code,
    currentLine,
    className,
    onClick,
    showOverlay = false,
}: CodeSyntaxHighlighterProps) {
    return (
        <div className="relative h-full" data-testid="code-editor-read">
            <SyntaxHighlighter
                language="python"
                customStyle={{
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                    fontSize: '0.75rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    height: '100%',
                    overflow: 'auto',
                    lineHeight: '1.3',
                    cursor: 'text',
                }}
                showLineNumbers={true}
                lineNumberStyle={{
                    minWidth: '0.25rem',
                    paddingRight: '0.75rem',
                    color: '#6b7280',
                    fontSize: '0.7rem',
                    textAlign: 'right',
                    userSelect: 'none',
                }}
                wrapLines={true}
                lineProps={(lineNumber) => {
                    const isCurrentLine = currentLine === lineNumber;
                    return {
                        style: {
                            display: 'block',
                            backgroundColor: isCurrentLine ? 'rgb(219 234 254)' : 'transparent',
                            borderLeft: isCurrentLine ? '3px solid rgb(59 130 246)' : '3px solid transparent',
                            fontWeight: isCurrentLine ? '500' : 'normal',
                            padding: '0.25rem 0.75rem',
                            transition: 'all 0.2s ease',
                            lineHeight: '1.3',
                            cursor: onClick ? 'pointer' : 'text',
                        },
                        'data-line-number': lineNumber,
                        'data-is-current': isCurrentLine,
                        onClick: onClick ? () => onClick() : undefined,
                    };
                }}
                className={cn('h-full', className)}
            >
                {code || ''}
            </SyntaxHighlighter>

            {showOverlay && (
                <div
                    style={{ position: "absolute", inset: 0, zIndex: 50, cursor: 'text' }}
                    tabIndex={0}
                    aria-label="View code"
                    onClick={onClick}
                >
                    <ComputationWorkspaceOverlay />
                </div>
            )}
        </div>
    );
} 