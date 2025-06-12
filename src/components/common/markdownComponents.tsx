import { BookOpen } from 'lucide-react';

// Type helpers for markdown component props
import type { PropsWithChildren } from 'react';

type CodeProps = PropsWithChildren<{ className?: string }>;
type ChildrenOnly = PropsWithChildren<{}>;

export function markdownComponents(lessonData?: any) {
    return {
        h1: ({ children }: ChildrenOnly) => (
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
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
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">
                {children}
            </h2>
        ),
        h3: ({ children }: ChildrenOnly) => (
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2 mt-4">
                {children}
            </h3>
        ),
        code: ({ children, className }: CodeProps) => {
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
        },
        pre: ({ children }: ChildrenOnly) => (
            <pre className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-x-auto text-sm">
                {children}
            </pre>
        ),
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
        p: ({ children }: ChildrenOnly) => (
            <p className="text-slate-700 mb-4 dark:text-slate-300">
                {children}
            </p>
        ),
    };
} 