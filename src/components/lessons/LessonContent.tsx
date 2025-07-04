import { ChevronRight } from 'lucide-react';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { markdownComponents } from '@/components/common/markdownComponents';
import TaskList from '@/components/lessons/TaskList';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLessonNavigation } from '@/hooks/useLessonNavigation';
import { getLessonHook, hasLessonHook } from '@/lessons';
import { useLessonStore } from '@/store/lessonStore';

import type { Lesson } from '@/types/lesson';

interface LessonContentProps {
    currentCourseId: string;
    currentModuleId: string;
    lesson: Lesson;
}

const LessonContent: React.FC<LessonContentProps> = ({
    lesson,
    currentCourseId,
    currentModuleId,
}) => {
    // Navigation logic
    const navigationInfo = useLessonNavigation();

    // Get lesson state from store
    const {
        content,
        isLoading,
        error,
        setLoading,
        setError,
        isComplete
    } = useLessonStore();

    // Try to get lesson hook
    const lessonHook = hasLessonHook(lesson.id) ? getLessonHook(lesson.id) : null;
    const hook = lessonHook ? lessonHook(lesson.id) : null;

    useEffect(() => {
        // Find the lesson data for metadata
        if (!lessonHook) {
            setError('No content available for this lesson');
            setLoading(false);
        }
    }, [lessonHook, setLoading, setError]);

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
        <Card className="h-full flex flex-col lg:py-0">
            <CardContent className="flex-1 overflow-y-auto p-3">
                <div>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents(lesson)}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>

                <TaskList
                    lesson={lesson}
                    currentCourseId={currentCourseId}
                    currentModuleId={currentModuleId}
                />

                <div className="w-full mt-6">
                    <div className="flex justify-end items-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        onClick={() => navigationInfo.gotoNextLesson()}
                                        disabled={!navigationInfo.nextLesson || !isComplete}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${navigationInfo.nextLesson && isComplete
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="text-sm">
                                            {navigationInfo.nextLesson ? 'Next: ' + navigationInfo.nextLesson.title : 'Course complete!'}
                                        </span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {(!navigationInfo.nextLesson || !isComplete) && (
                                <TooltipContent side="top" align="end">
                                    Please complete all tasks to continue.
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LessonContent; 