import {
    CheckCircle, ChevronDown, ClipboardCheck, Crown, Play, Sparkles, Sword
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

import { markdownComponents } from '@/components/common/markdownComponents';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLessonNavigation } from '@/hooks/useLessonNavigation';
import { useLessonStore } from '@/store/lessonStore';
import { useTraceStore } from '@/store/traceStore';
import { trackLessonCompleted } from '@/utils/analytics';
import { ProgressStorage } from '@/utils/progressStorage';

import type { Lesson } from '@/types/lesson';
interface TaskListProps {
    lesson: Lesson;
    currentCourseId: string;
    currentModuleId: string;
}

const TaskList: React.FC<TaskListProps> = ({ lesson, currentCourseId, currentModuleId }) => {
    const {
        allTasks,
        completedTaskCount,
        completeLesson,
        finishAllTasks,
        isComplete,
    } = useLessonStore();
    const {
        currentProblemId,
    } = useTraceStore();
    const { gotoNextLesson } = useLessonNavigation();

    // State to track which task is open (only one at a time)
    const [openTaskId, setOpenTaskId] = useState<string | null>(null);

    // State for completion modal
    const [showCompletionModal, setShowCompletionModal] = useState(false);


    // If the lesson is already completed, finish all tasks. 
    useEffect(() => {
        if (allTasks.length > 0 && ProgressStorage.isLessonCompleted(currentCourseId, currentModuleId, lesson.id)) {
            finishAllTasks();
        }
    }, [allTasks, currentCourseId, currentModuleId, lesson.id, finishAllTasks]);

    // Update open task when current task changes
    useEffect(() => {
        if (allTasks.length > 0 && completedTaskCount < allTasks.length) {
            const currentTask = allTasks[completedTaskCount]!;
            setOpenTaskId(currentTask.id);
        }
    }, [allTasks, completedTaskCount]);

    // Complement the users!
    useEffect(() => {
        if (allTasks.length > 0 && !isComplete) {
            // Completed the lesson
            if (completedTaskCount === allTasks.length) {
                // Log the lesson completion
                trackLessonCompleted(lesson.id, currentCourseId, currentModuleId);
                completeLesson();
                setShowCompletionModal(true);
                // Mark lesson as completed in ProgressStorage
                if (currentCourseId && currentModuleId) {
                    ProgressStorage.markLessonCompleted(currentCourseId, currentModuleId, lesson.id);
                }
            } else if (completedTaskCount > 0) {
                // Just show a toast
                toast.success(`Great Job! Task ${completedTaskCount} of ${allTasks.length} completed!`);
            }
        }
    }, [allTasks, isComplete, completedTaskCount, lesson.id, currentProblemId, currentCourseId, currentModuleId]);

    // Auto-close modal after 3 seconds
    useEffect(() => {
        if (showCompletionModal) {
            const timer = setTimeout(() => {
                setShowCompletionModal(false);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [showCompletionModal]);

    const handleTaskToggle = (taskId: string, isOpen: boolean) => {
        setOpenTaskId(isOpen ? taskId : null);
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
                {allTasks.slice(0, completedTaskCount + 1).map((task, index) => {
                    const isCompleted = index < completedTaskCount;
                    const isCurrent = !isCompleted && index === completedTaskCount;
                    const isOpen = openTaskId === task.id;

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
                                <div className={`p-4 rounded-b-lg border border-t-0 ${isCompleted
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                    : isCurrent
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600'
                                    }`}>
                                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents()}>
                                            {task.description}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>

            {/* Completion Modal */}
            <Dialog open={showCompletionModal} >
                <DialogContent className="sm:max-w-lg border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20" showCloseButton={false}>
                    <style>{`
                        @keyframes wiggle {
                            0%, 100% { transform: rotate(0deg); }
                            25% { transform: rotate(-3deg) scale(1.05); }
                            75% { transform: rotate(3deg) scale(1.05); }
                        }
                        @keyframes fadeInUp {
                            from {
                                opacity: 0;
                                transform: translateY(30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        @keyframes sparkleFloat {
                            0%, 100% { 
                                transform: translateY(0px) scale(1);
                                opacity: 0.8;
                            }
                            50% { 
                                transform: translateY(-10px) scale(1.2);
                                opacity: 1;
                            }
                        }
                        @keyframes sparkleRotate {
                            0% { 
                                transform: rotate(0deg) scale(0.8);
                                opacity: 0.6;
                            }
                            50% { 
                                transform: rotate(180deg) scale(1.2);
                                opacity: 1;
                            }
                            100% { 
                                transform: rotate(360deg) scale(0.8);
                                opacity: 0.6;
                            }
                        }
                        @keyframes buttonPulse {
                            0%, 70%, 100% { 
                                transform: scale(1);
                                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
                            }
                            35% { 
                                transform: scale(1.05);
                                box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
                            }
                        }
                    `}</style>
                    {/* Confetti Explosions from both sides */}
                    <>
                        {/* Left side confetti */}
                        <div className="fixed top-1/2 left-0 pointer-events-none z-50" style={{ transform: 'translateY(-50%)' }}>
                            <ConfettiExplosion
                                particleCount={100}
                                particleSize={12}
                                duration={3000}
                                colors={['#FFD700', '#FF6B35', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B']}
                                force={0.6}
                                height="80vh"
                                width={800}
                            />
                        </div>
                        {/* Right side confetti */}
                        <div className="fixed top-1/2 right-0 pointer-events-none z-50" style={{ transform: 'translateY(-50%) scaleX(-1)' }}>
                            <ConfettiExplosion
                                particleCount={100}
                                particleSize={12}
                                duration={3000}
                                colors={['#FFD700', '#FF6B35', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B']}
                                force={0.6}
                                height="80vh"
                                width={800}
                            />
                        </div>
                    </>

                    <div className="text-center py-8 relative">
                        {/* Modal-wide sparkles */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Top area sparkles */}
                            <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-300 rounded-full animate-[sparkleFloat_2.5s_ease-in-out_infinite] delay-100"></div>
                            <div className="absolute top-6 right-12 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-300"></div>
                            <div className="absolute top-2 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-[sparkleRotate_3s_linear_infinite] delay-500"></div>
                            <div className="absolute top-8 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-700"></div>

                            {/* Middle area sparkles */}
                            <div className="absolute top-1/3 left-4 w-1 h-1 bg-pink-400 rounded-full animate-[sparkleFloat_1.8s_ease-in-out_infinite] delay-200"></div>
                            <div className="absolute top-1/3 right-6 w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-600"></div>
                            <div className="absolute top-1/2 left-2 w-1 h-1 bg-orange-400 rounded-full animate-[sparkleRotate_2s_linear_infinite] delay-800"></div>
                            <div className="absolute top-1/2 right-4 w-1 h-1 bg-red-400 rounded-full animate-pulse delay-1000"></div>

                            {/* Bottom area sparkles */}
                            <div className="absolute bottom-8 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-[sparkleFloat_2.2s_ease-in-out_infinite] delay-400"></div>
                            <div className="absolute bottom-6 right-8 w-1 h-1 bg-indigo-400 rounded-full animate-ping delay-900"></div>
                            <div className="absolute bottom-4 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-[sparkleRotate_2.8s_linear_infinite] delay-1100"></div>
                            <div className="absolute bottom-2 right-1/3 w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-1300"></div>
                        </div>

                        {/* Animated Crown & Sword */}
                        <div className="flex justify-center mb-6">
                            <div className="relative animate-bounce">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                                <Crown className="h-28 w-28 text-yellow-500 relative z-10 drop-shadow-2xl animate-[wiggle_0.5s_ease-in-out_infinite]" />
                                <div className="absolute -top-2 -right-4 animate-[spin_3s_linear_infinite]">
                                    <Sparkles className="h-8 w-8 text-purple-400 drop-shadow-lg animate-pulse" />
                                </div>
                                <div className="absolute -bottom-3 -left-4 animate-[wiggle_1s_ease-in-out_infinite]">
                                    <Sword className="h-10 w-10 text-slate-600 drop-shadow-lg" />
                                </div>
                                {/* Crown-focused sparkles (reduced) */}
                                <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping delay-200"></div>
                                <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-400"></div>
                                <div className="absolute top-3 -left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-600"></div>
                                <div className="absolute -top-3 right-2 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-800"></div>

                                {/* Crown area floating sparkles (reduced) */}
                                <div className="absolute -top-4 -left-1 w-1 h-1 bg-yellow-400 rounded-full animate-[sparkleFloat_2s_ease-in-out_infinite] delay-1000"></div>
                                <div className="absolute bottom-2 -right-1 w-1 h-1 bg-purple-300 rounded-full animate-[sparkleRotate_3s_linear_infinite] delay-1200"></div>
                            </div>
                        </div>

                        {/* Animated Text */}
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
                                Victory!
                            </h2>
                            <p className="text-xl text-slate-700 dark:text-slate-300 font-bold animate-[fadeInUp_0.6s_ease-out_0.6s_both]">
                                ⚔️ Quest Complete! ⚔️
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 animate-[fadeInUp_0.6s_ease-out_0.9s_both]">
                                You have proven yourself worthy, brave adventurer!
                            </p>
                        </div>

                        {/* Continue Button */}
                        <div className="mt-10 animate-[fadeInUp_0.6s_ease-out_0.9s_both]">
                            <Button
                                onClick={() => {
                                    setShowCompletionModal(false);
                                    gotoNextLesson();
                                }}
                                className="px-10 py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-full shadow-2xl hover:shadow-green-500/25 transform hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-green-400/50 animate-[buttonPulse_4s_ease-in-out_infinite]"
                            >
                                ✨ Continue ✨
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskList; 