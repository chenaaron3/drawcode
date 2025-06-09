import React from 'react';

import lessonProblemsData from '../data/lesson-problems.json';
import { useTraceStore } from '../store/traceStore';
import LessonContent from './LessonContent';
import TraceVisualizer from './TraceVisualizer';

import type { Lesson } from '../types/lesson';

interface LessonPageProps {
    lesson: Lesson;
}

export const LessonPage: React.FC<LessonPageProps> = ({ lesson }) => {
    const { currentProblemId } = useTraceStore();

    // Get current lesson data based on the current problem
    const currentLessonData = currentProblemId
        ? (lessonProblemsData as Lesson[]).find(lesson => lesson.id === currentProblemId) || null
        : null;

    return (
        <div className="h-full flex gap-6 p-6">
            {/* Left Half: Lesson Content */}
            <div className="w-1/2 h-full">
                {currentLessonData && (
                    <LessonContent
                        key={currentLessonData.id}
                        lessonId={currentLessonData.id}
                        lessonTitle={currentLessonData.title}
                        lessonDescription={currentLessonData.description}
                    />
                )}
            </div>

            {/* Right Half: Trace Visualizer (stacked layout) */}
            <div className="w-1/2 h-full overflow-visible">
                <TraceVisualizer isStacked={true} />
            </div>
        </div>
    );
}; 