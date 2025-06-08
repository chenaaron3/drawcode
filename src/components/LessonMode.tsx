import React, { useEffect, useState } from 'react';

// Import the lesson data
import lessonModulesData from '../data/lesson-modules.json';
import lessonProblemsData from '../data/lesson-problems.json';
import { useTraceStore } from '../store/traceStore';
import { LessonPage } from './LessonPage';
import { LessonSidebar } from './LessonSidebar';

import type { LessonModule, Lesson } from '../types/lesson';

const LessonMode: React.FC = () => {
    const { getCurrentProblemId, setCurrentProblem } = useTraceStore();
    const [modules] = useState<LessonModule[]>(lessonModulesData.modules as LessonModule[]);
    const [lessons] = useState<Lesson[]>(lessonProblemsData as Lesson[]);

    const selectedLessonId = getCurrentProblemId();

    // Default to first lesson if no problem is selected
    useEffect(() => {
        if (!selectedLessonId && lessons.length > 0) {
            setCurrentProblem(lessons[0].id);
        }
    }, [lessons, selectedLessonId, setCurrentProblem]);

    const selectedLesson = lessons.find(l => l.id === selectedLessonId);

    return (
        <div className="h-full flex w-full">
            <LessonSidebar
                modules={modules}
                lessons={lessons}
                selectedLessonId={selectedLessonId || undefined}
                onLessonSelect={setCurrentProblem}
            />

            <div className="flex-1">
                {selectedLesson ? (
                    <LessonPage
                        lesson={selectedLesson}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                Select a lesson to get started
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">
                                Choose a lesson from the sidebar to begin learning Python.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonMode; 