import { BookOpen, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import TaskList from '@/components/lessons/TaskList';
import { Card, CardContent } from '@/components/ui/card';
import lessonProblemsData from '@/data/lesson-problems.json';
import { useLessonNavigation } from '@/hooks/useLessonNavigation';
import { getLessonHook, hasLessonHook } from '@/lessons';
import { useLessonStore } from '@/store/lessonStore';
import { useTraceStore } from '@/store/traceStore';

interface LessonContentProps {
    lessonId: string;
    lessonTitle: string;
    lessonDescription: string;
}

const LessonContent: React.FC<LessonContentProps> = ({
    lessonId,
    lessonTitle,
    lessonDescription
}) => {
    const [lessonData, setLessonData] = useState<any>(null);

    // Navigation logic
    const { setCurrentProblem } = useTraceStore();
    const navigationInfo = useLessonNavigation();

    // Get lesson state from store
    const {
        content,
        isLoading,
        error,
        setLoading,
        setError
    } = useLessonStore();

    // Try to get lesson hook
    const lessonHook = hasLessonHook(lessonId) ? getLessonHook(lessonId) : null;
    lessonHook ? lessonHook(lessonId) : null;

    useEffect(() => {
        // Find the lesson data for metadata
        const foundLessonData = lessonProblemsData.find(lesson => lesson.id === lessonId);
        setLessonData(foundLessonData);
        if (!lessonHook) {
            setError('No content available for this lesson');
            setLoading(false);
        }
    }, [lessonId, lessonHook, setLoading, setError]);

    if (isLoading) {
        return (
            <Card className="h-full flex flex-col">
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading lesson content...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="flex-1 overflow-y-auto">
                <div>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // Custom components for better styling
                                h1: ({ children }) => (
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
                                h2: ({ children }) => (
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 mt-6">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2 mt-4">
                                        {children}
                                    </h3>
                                ),
                                code: ({ children, className }) => {
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
                                pre: ({ children }) => (
                                    <pre className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-x-auto text-sm">
                                        {children}
                                    </pre>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                                        {children}
                                    </blockquote>
                                ),
                                table: ({ children }) => (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                th: ({ children }) => (
                                    <th className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-left font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                                        {children}
                                    </td>
                                ),
                                p: ({ children }) => (
                                    <p className="text-slate-700 mb-4 dark:text-slate-300">
                                        {children}
                                    </p>
                                )
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>

                <TaskList />

                <div className="w-full mt-6">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => navigationInfo.nextLesson && setCurrentProblem(navigationInfo.nextLesson.id)}
                            disabled={!navigationInfo.nextLesson}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${navigationInfo.nextLesson
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            <span className="text-sm">
                                {navigationInfo.nextLesson ? 'Next: ' + navigationInfo.nextLesson.title : 'Course complete!'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LessonContent; 