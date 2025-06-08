import React from 'react';

import TraceVisualizer from './TraceVisualizer';

import type { Lesson } from '../types/lesson';

interface LessonPageProps {
    lesson: Lesson;
}

export const LessonPage: React.FC<LessonPageProps> = ({ lesson }) => {
    return (
        <div className="h-full flex flex-col">
            {/* Lesson Plan Section */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="max-w-none p-6">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <h1>{lesson.title}</h1>
                        <p>{lesson.description}</p>
                    </div>

                </div>
            </div>

            {/* Existing Debugger Interface */}
            <div className="flex-1 min-h-0">
                <div className="px-4 lg:px-24 w-full p-6 my-auto min-h-[calc(100vh-120px)] lg:h-[90vh] overflow-visible">
                    <TraceVisualizer />
                </div>
            </div>
        </div>
    );
}; 