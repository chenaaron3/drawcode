import { Check, ChevronRight, Play } from 'lucide-react';
import React, { useState } from 'react';

import { ProgressStorage } from '../../utils/progressStorage';

import type { LessonModule, Lesson, LessonCourse } from '@/types/lesson';
interface LessonSidebarProps {
    modules: LessonModule[];
    lessons: Lesson[];
    currentLesson: Lesson;
    currentCourse: LessonCourse;
    currentModule: LessonModule;
    onLessonSelect: (lessonId: string) => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
    modules,
    lessons,
    currentLesson,
    currentCourse,
    currentModule,
    onLessonSelect,
}) => {
    // State to track which module is expanded (only one at a time)
    // Initialize with the current module if it exists
    const [expandedModuleId, setExpandedModuleId] = useState<string>(
        currentModule.id
    );

    const handleLessonSelect = (lessonId: string) => {
        // Find which module this lesson belongs to
        const lessonModule = modules.find(module => module.lessonIds.includes(lessonId));

        // If selecting a lesson from a different module, auto-expand that module
        if (lessonModule && expandedModuleId !== lessonModule.id) {
            setExpandedModuleId(lessonModule.id);
        }

        // Call the original lesson select handler
        onLessonSelect(lessonId);
    };

    return (
        <div className="space-y-3 w-full">
            {modules.map((module) => {
                const isExpanded = expandedModuleId === module.id;
                const moduleLessons = module.lessonIds
                    .map(id => lessons.find(l => l.id === id))
                    .filter((lesson): lesson is Lesson => lesson !== undefined);

                return (
                    <div key={module.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        {/* Module Header */}
                        <button
                            type="button"
                            onClick={() => setExpandedModuleId(module.id)}
                            className="w-full flex items-center gap-3 text-left p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ChevronRight
                                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'
                                    }`}
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                                    {module.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                                    {module.description}
                                </p>
                            </div>
                        </button>

                        {/* Module Lessons - Only render when expanded */}
                        {isExpanded && moduleLessons.length > 0 && (
                            <div className="border-t border-slate-200 dark:border-slate-700">
                                {moduleLessons.map((lesson) => {
                                    const isSelected = currentLesson.id === lesson.id;
                                    const isCompleted = ProgressStorage.isLessonCompleted(currentCourse.id, module.id, lesson.id);

                                    return (
                                        <button
                                            key={lesson.id}
                                            type="button"
                                            onClick={() => handleLessonSelect(lesson.id)}
                                            className={`w-full flex items-center gap-3 text-left p-3 border-b border-slate-100 dark:border-slate-600 last:border-b-0 transition-colors ${isSelected
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                                                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted
                                                ? 'bg-green-100 dark:bg-green-800'
                                                : isSelected
                                                    ? 'bg-blue-100 dark:bg-blue-800'
                                                    : 'bg-slate-100 dark:bg-slate-600'
                                                }`}>
                                                {isCompleted ? (
                                                    <Check className="w-3 h-3 text-green-600 dark:text-green-300" />
                                                ) : (
                                                    <Play className={`w-3 h-3 ${isSelected
                                                        ? 'text-blue-600 dark:text-blue-300'
                                                        : 'text-slate-600 dark:text-slate-300'
                                                        }`} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="text-sm font-medium truncate">
                                                        {lesson.title}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                        {lesson.time} min
                                                    </div>
                                                </div>
                                                {lesson.description && (
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                                                        {lesson.description}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}; 