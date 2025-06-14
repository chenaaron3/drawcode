import React from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { ResizeHandle } from '../common';
import { TraceVisualizer } from '../layout';
import LessonContent from './LessonContent';

import type { Lesson } from '../../types/lesson';

interface LessonPageProps {
    lesson: Lesson | null;
    currentCourseId: string;
    currentModuleId: string;
}

const LessonPage: React.FC<LessonPageProps> = ({ lesson, currentCourseId, currentModuleId }) => {

    return (
        <div className="h-full p-6">
            <div className="group/lesson h-full">
                <PanelGroup direction="horizontal" className="h-full">
                    {/* Left: Lesson Content (1/3) */}
                    <Panel defaultSize={33.33} minSize={25}>
                        <div className="h-full">
                            {lesson && (
                                <LessonContent
                                    key={lesson.id}
                                    lesson={lesson}
                                    currentCourseId={currentCourseId}
                                    currentModuleId={currentModuleId ?? ""}
                                />
                            )}
                        </div>
                    </Panel>

                    <ResizeHandle direction="horizontal" />

                    {/* Right: TraceVisualizer (2/3, split 50/50 internally) */}
                    <Panel defaultSize={66.67} minSize={50}>
                        <div className="h-full overflow-visible">
                            <TraceVisualizer />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
};

export { LessonPage }; 