import { ArrowLeft, Check, ChevronRight, Lock, Play } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLessonNavigation } from '@/hooks/useLessonNavigation';
import { useAppStore } from '@/store/appStore';
import { useProgressStore } from '@/store/progressStore';
import { useTraceStore } from '@/store/traceStore';

import type { LessonModule, Lesson, LessonCourse } from '@/types/lesson';
interface LessonSidebarProps {
    modules: LessonModule[];
    lessons: Lesson[];
    currentLesson: Lesson;
    currentCourse: LessonCourse;
    currentModule: LessonModule;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
    modules,
    lessons,
    currentLesson,
    currentCourse,
    currentModule,
}) => {
    const { getUnlockedLesson } = useLessonNavigation();
    const progressStore = useProgressStore();
    const { isSidebarOpen, setSidebarOpen } = useAppStore();
    const router = useRouter();
    // State to track which module is expanded (only one at a time)
    // Initialize with the current module if it exists
    const [expandedModuleId, setExpandedModuleId] = useState<string>(
        currentModule.id
    );

    const handleBackToSyllabus = () => {
        if (currentCourse) {
            router.push(`/lesson/${currentCourse.id}`);
            setSidebarOpen(false);
        }
    };

    return (
        <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="min-w-[20rem] max-w-[24rem] p-0 flex flex-col">
                <SheetHeader className="mx-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <SheetTitle className="text-lg font-semibold">{currentCourse.title}</SheetTitle>
                </SheetHeader>
                <div className="flex-1 px-6 py-4 overflow-y-auto">
                    {/* Back to Syllabus Button */}
                    {currentCourse && (
                        <button
                            onClick={handleBackToSyllabus}
                            className="flex items-center gap-2 mb-4 px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors w-full"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Syllabus
                        </button>
                    )}
                    <div className="space-y-3 w-full">
                        {modules.map((module) => {
                            const isExpanded = expandedModuleId === module.id;
                            const moduleLessons = module.lessonIds
                                .map(id => lessons.find(l => l.id === id))
                                .filter((lesson): lesson is Lesson => lesson !== undefined);

                            return (
                                <div key={module.id} className="border border-slate-300 rounded-lg overflow-hidden">
                                    {/* Module Header */}
                                    <button
                                        type="button"
                                        onClick={() => setExpandedModuleId(module.id)}
                                        className="w-full flex items-center gap-3 text-left p-4 bg-slate-200 text-slate-900 font-semibold border-b border-slate-300 hover:bg-slate-300 transition-colors"
                                    >
                                        <ChevronRight
                                            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'
                                                }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 text-sm truncate">
                                                {module.title}
                                            </h3>
                                            <p className="text-xs text-slate-700 mt-0.5 truncate">
                                                {module.description}
                                            </p>
                                        </div>
                                    </button>

                                    {/* Module Lessons - Only render when expanded */}
                                    <div
                                        className={`border-t border-slate-300 overflow-hidden transition-all duration-300
                                ${isExpanded && moduleLessons.length > 0 ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                                    >
                                        {moduleLessons.map((lesson) => {
                                            const isSelected = currentLesson.id === lesson.id;
                                            const isCompleted = progressStore.isLessonCompleted(currentCourse.id, module.id, lesson.id);
                                            const isAvailable = isCompleted || lesson.id == getUnlockedLesson()?.id;

                                            let icon = null;
                                            // All lessons in the past should be completed
                                            // Only the current lesson should available
                                            // All future lessons should be locked
                                            if (isCompleted) {
                                                icon = <Check className="w-3 h-3 text-green-900" />
                                            } else if (isAvailable) {
                                                icon = <Play className={`w-3 h-3 text-slate-700`} />
                                            } else {
                                                icon = <Lock className="w-3 h-3 text-slate-700" />
                                            }

                                            return (
                                                <Link
                                                    key={lesson.id}
                                                    href={`/lesson/${currentCourse.id}/${module.id}/${lesson.id}`}
                                                    className={`w-full flex items-center gap-3 text-left p-3 border-b border-slate-300 last:border-b-0 transition-colors
                                                        ${isSelected
                                                            ? 'bg-blue-200 text-blue-900 hover:bg-blue-300'
                                                            : isCompleted
                                                                ? 'bg-green-100 text-green-900 hover:bg-green-200'
                                                                : 'bg-slate-50 text-slate-900 hover:bg-slate-200'
                                                        }`}
                                                    onClick={() => {
                                                        setSidebarOpen(false);
                                                    }}
                                                    tabIndex={isAvailable ? 0 : -1}
                                                    aria-disabled={!isAvailable}
                                                    style={!isAvailable ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                                                >
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted
                                                        ? 'bg-green-200'
                                                        : isSelected
                                                            ? 'bg-blue-300'
                                                            : 'bg-slate-100'
                                                        }  group-hover:bg-green-300`}>
                                                        {icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="text-sm font-medium truncate">
                                                                {lesson.title}
                                                            </div>
                                                            <div className="text-xs text-slate-600 flex-shrink-0">
                                                                {lesson.time} min
                                                            </div>
                                                        </div>
                                                        {lesson.description && (
                                                            <div className="text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                                                                {lesson.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}; 