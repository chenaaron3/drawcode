import { BookOpen, Copy } from 'lucide-react';
import React, { useState } from 'react';

// Type helpers for markdown component props
import type { PropsWithChildren } from 'react';

type CodeProps = PropsWithChildren<{ className?: string }>;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ChildrenOnly = PropsWithChildren<{}>;

export function markdownComponents(lessonData?: any) {
    // Define the code renderer as a named function so we can reference it
    function CodeRenderer({ children, className }: CodeProps) {
        const isInline = !className;
        if (isInline) {
            return (
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded text-sm font-mono">
                    {children}
                </code>
            );
        }
        return (
            <code className={className}>
                {children}
            </code>
        );
    }

    function PreRenderer({ children }: ChildrenOnly) {
        // Utility to extract text from ReactNode
        function extractText(node: React.ReactNode): string {
            if (typeof node === 'string') return node;
            if (Array.isArray(node)) return node.map(extractText).join('');
            if (React.isValidElement(node) && node.props) {
                return extractText((node as React.ReactElement<any>).props.children);
            }
            return '';
        }

        // Find the code element
        const codeElement = React.Children.toArray(children).find(
            (child) => React.isValidElement(child) && child.type === CodeRenderer
        ) as React.ReactElement | undefined;

        const [copied, setCopied] = useState(false);

        // Extract and trim code text
        let codeText = '';
        if (React.isValidElement(codeElement) && codeElement.props) {
            codeText = extractText((codeElement as React.ReactElement<any>).props.children)
                .replace(/^[\n\r]+|[\n\r]+$/g, '') // trim leading/trailing newlines
                .replace(/[ \t]+$/gm, ''); // trim trailing spaces on each line
        }

        const handleCopy = async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!codeText) return;
            try {
                await navigator.clipboard.writeText(codeText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            } catch (e) {
                // fallback or error
            }
        };

        return (
            <div className="relative group" tabIndex={0}>
                <pre className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-x-auto text-sm my-2 select-text">
                    {/* Render the code element with trimmed text */}
                    {codeElement
                        ? React.cloneElement(codeElement, {}, codeText)
                        : children}
                    {codeElement && codeText && (
                        <button
                            type="button"
                            aria-label={copied ? 'Copied!' : 'Copy code'}
                            onClick={handleCopy}
                            tabIndex={-1}
                            className={
                                `absolute top-2 right-2 z-10 p-1 rounded bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow transition-all duration-200 ` +
                                (copied
                                    ? 'opacity-100 scale-110'
                                    : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100') +
                                ' hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none'
                            }
                            title={copied ? 'Copied!' : 'Copy code'}
                        >
                            {copied ? (
                                <span className="text-xs font-medium text-green-600 px-2">Copied!</span>
                            ) : (
                                <Copy className="h-4 w-4 text-slate-500" />
                            )}
                        </button>
                    )}
                </pre>
            </div>
        );
    }

    return {
        h1: ({ children }: ChildrenOnly) => (
            <h1 className="flex items-center gap-2 text-lg md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                <BookOpen className="h-6 w-6 text-blue-600" />
                {children}
                {lessonData?.time && (
                    <span className="ml-auto text-sm font-normal text-slate-500 dark:text-slate-400">
                        {lessonData.time} min
                    </span>
                )}
            </h1>
        ),
        h2: ({ children }: ChildrenOnly) => (
            <h2 className="text-base md:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">
                {children}
            </h2>
        ),
        h3: ({ children }: ChildrenOnly) => (
            <h3 className="text-base md:text-lg font-medium text-slate-900 dark:text-slate-100 mb-2 mt-4">
                {children}
            </h3>
        ),
        code: CodeRenderer,
        pre: PreRenderer,
        blockquote: ({ children }: ChildrenOnly) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                {children}
            </blockquote>
        ),
        table: ({ children }: ChildrenOnly) => (
            <div className="overflow-x-auto">
                <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    {children}
                </table>
            </div>
        ),
        th: ({ children }: ChildrenOnly) => (
            <th className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-left font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
                {children}
            </th>
        ),
        td: ({ children }: ChildrenOnly) => (
            <td className="px-4 py-2 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                {children}
            </td>
        ),
        ul: ({ children }: ChildrenOnly) => (
            <ul className="list-disc list-inside text-sm md:text-base text-slate-700 mb-4 dark:text-slate-300">
                {children}
            </ul>
        ),
        p: ({ children }: ChildrenOnly) => (
            <p className="text-sm md:text-base text-slate-700 mb-4 dark:text-slate-300">
                {children}
            </p>
        ),
    };
} 