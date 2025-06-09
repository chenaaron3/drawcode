import { ChevronDown, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import type { LessonModule, Lesson } from '../types/lesson';

interface LessonSidebarProps {
    modules: LessonModule[];
    lessons: Lesson[];
    selectedLessonId?: string;
    onLessonSelect: (lessonId: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
    modules,
    lessons,
    selectedLessonId,
    onLessonSelect,
    isCollapsed = false,
    onToggleCollapse,
}) => {
    // Find which module contains the currently selected lesson
    const currentModule = useMemo(() => {
        if (!selectedLessonId) return null;
        return modules.find(module => module.lessonIds.includes(selectedLessonId));
    }, [selectedLessonId, modules]);

    // State to track which module is expanded (only one at a time)
    const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
        currentModule?.id || null
    );

    // Update expanded module when selected lesson changes
    useEffect(() => {
        if (currentModule) {
            setExpandedModuleId(currentModule.id);
        }
    }, [currentModule]);

    const toggleModule = (moduleId: string) => {
        // Accordion behavior: if clicking the same module, collapse it; otherwise, expand the clicked one
        setExpandedModuleId(prev => prev === moduleId ? null : moduleId);
    };
    return (
        <div className="relative flex h-full">
            {/* Main Sidebar Content */}
            <div className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'
                } overflow-hidden`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Python Fundamentals
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-in slide-in-from-left duration-500 min-h-0">
                    {modules.map((module) => {
                        const isExpanded = expandedModuleId === module.id;

                        return (
                            <div key={module.id} className="space-y-2">
                                {/* Module Header */}
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full flex items-center gap-2 text-left p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                                >
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                        <ChevronDown className="w-4 h-4 text-slate-400 transition-colors duration-200" />
                                    </div>
                                    <div className="transition-all duration-200">
                                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                            {module.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {module.description}
                                        </p>
                                    </div>
                                </button>

                                {/* Module Lessons */}
                                <div className={`ml-6 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'h-full opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className={`space-y-1 transition-transform duration-300 ${isExpanded ? 'translate-y-0' : '-translate-y-2'
                                        }`}>
                                        {module.lessonIds.map((lessonId, index) => {
                                            const lesson = lessons.find(l => l.id === lessonId);
                                            if (!lesson) return null;

                                            const isSelected = selectedLessonId === lesson.id;

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => onLessonSelect(lesson.id)}
                                                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm group ${isSelected
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-md'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                                                        }`}
                                                    style={{
                                                        transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected
                                                            ? 'bg-blue-100 dark:bg-blue-800 scale-110'
                                                            : 'bg-slate-100 dark:bg-slate-700 group-hover:scale-105'
                                                            }`}>
                                                            <Play className={`w-4 h-4 transition-all duration-200 ${isSelected
                                                                ? 'text-blue-600 dark:text-blue-300 scale-110'
                                                                : 'text-slate-600 dark:text-slate-300'
                                                                }`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`font-medium text-sm transition-all duration-200 ${isSelected
                                                                ? 'text-blue-900 dark:text-blue-100'
                                                                : 'text-slate-900 dark:text-slate-100'
                                                                }`}>
                                                                {lesson.title}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Toggle Button - Always visible tab on the right edge */}
            <button
                onClick={onToggleCollapse}
                className="w-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-l-0 rounded-r-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                style={{ marginTop: '2rem' }}
            >
                <div className="transition-transform duration-300 ease-in-out">
                    {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-slate-600 dark:text-slate-400 transition-colors duration-200" />
                    ) : (
                        <ChevronLeft className="w-3 h-3 text-slate-600 dark:text-slate-400 transition-colors duration-200" />
                    )}
                </div>
            </button>
        </div>
    );
}; 