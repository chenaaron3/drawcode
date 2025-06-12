import { CheckCircle, ChevronDown, ClipboardCheck, Play } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLessonStore } from '@/store/lessonStore';

const TaskList: React.FC = () => {
    const {
        allTasks,
        completedTaskCount,
    } = useLessonStore();

    // State to track which tasks are open
    const [openTasks, setOpenTasks] = useState<Set<string>>(new Set());

    const isLessonComplete = completedTaskCount === allTasks.length && allTasks.length > 0;

    // Update open tasks when current task changes
    useEffect(() => {
        if (allTasks.length > 0 && completedTaskCount < allTasks.length) {
            const currentTask = allTasks[completedTaskCount];
            setOpenTasks(new Set([currentTask.id]));
        }
    }, [allTasks, completedTaskCount]);

    const handleTaskToggle = (taskId: string, isOpen: boolean) => {
        setOpenTasks(prev => {
            const newSet = new Set(prev);
            if (isOpen) {
                newSet.add(taskId);
            } else {
                newSet.delete(taskId);
            }
            return newSet;
        });
    };

    if (allTasks.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 border-t pt-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    Your Task
                </h3>
                <span className="text-sm text-muted-foreground">
                    {completedTaskCount} of {allTasks.length} tasks completed
                </span>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {allTasks.map((task, index) => {
                    const isCompleted = index < completedTaskCount;
                    const isCurrent = !isCompleted && index === completedTaskCount;
                    const isOpen = openTasks.has(task.id);

                    return (
                        <Collapsible
                            key={task.id}
                            open={isOpen}
                            onOpenChange={(open) => handleTaskToggle(task.id, open)}
                        >
                            <CollapsibleTrigger className={`flex items-center justify-between w-full p-3 text-left border transition-colors ${isOpen
                                ? 'rounded-t-lg border-b-0'
                                : 'rounded-lg'
                                } ${isCompleted
                                    ? 'bg-green-100 dark:bg-green-800/40 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/60'
                                    : isCurrent
                                        ? 'bg-blue-100 dark:bg-blue-800/40 border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/60'
                                        : 'bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}>
                                <div className="flex items-center gap-2">
                                    {isCompleted ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : isCurrent ? (
                                        <Play className="h-4 w-4 text-blue-600" />
                                    ) : (
                                        <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                                    )}
                                    <span className={`font-medium ${isCompleted
                                        ? 'text-green-800 dark:text-green-200'
                                        : isCurrent
                                            ? 'text-blue-800 dark:text-blue-200'
                                            : 'text-slate-600 dark:text-slate-400'
                                        }`}>
                                        {task.title}
                                    </span>
                                </div>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCompleted
                                    ? 'text-green-600'
                                    : isCurrent
                                        ? 'text-blue-600'
                                        : 'text-slate-400'
                                    } ${isOpen ? 'rotate-180' : ''}`} />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className={`p-6 rounded-b-lg border border-t-0 ${isCompleted
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                    : isCurrent
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600'
                                    }`}>
                                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {task.description}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>

            {/* Completion Message */}
            {isLessonComplete && (
                <div className="text-center py-6 mt-4">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        All tasks completed!
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                        Great job! You've finished all the tasks for this lesson.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TaskList; 