import { ChevronRight, Play } from 'lucide-react';
import React from 'react';

import type { LessonModule, Lesson } from '../types/lesson';

interface LessonSidebarProps {
    modules: LessonModule[];
    lessons: Lesson[];
    selectedLessonId?: string;
    onLessonSelect: (lessonId: string) => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
    modules,
    lessons,
    selectedLessonId,
    onLessonSelect,
}) => {
    return (
        <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Python Lessons
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Learn programming fundamentals
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {modules.map((module) => (
                    <div key={module.id} className="space-y-2">
                        {/* Module Header */}
                        <div className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                    {module.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {module.description}
                                </p>
                            </div>
                        </div>

                        {/* Module Lessons */}
                        <div className="ml-6 space-y-1">
                            {module.lessonIds.map((lessonId) => {
                                const lesson = lessons.find(l => l.id === lessonId);
                                if (!lesson) return null;

                                const isSelected = selectedLessonId === lesson.id;

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => onLessonSelect(lesson.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${isSelected
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isSelected
                                                ? 'bg-blue-100 dark:bg-blue-800'
                                                : 'bg-slate-100 dark:bg-slate-700'
                                                }`}>
                                                <Play className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                                    {lesson.title}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 