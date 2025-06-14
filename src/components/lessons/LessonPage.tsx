import React, { useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { ResizeHandle } from '../common';
import { TraceVisualizer } from '../layout';
import CodePanel from '../panels/CodePanel';
import ExecutionPanel from '../panels/ExecutionPanel';
import LessonContent from './LessonContent';

import type { Lesson, LessonCourse, LessonModule } from '../../types/lesson';

// Simple hook for mobile detection (tailwind md breakpoint ~768px)
function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

const TABS = [
    { key: 'lesson', label: 'Lesson' },
    { key: 'code', label: 'Code' },
    { key: 'output', label: 'Output' },
] as const;
type TabKey = typeof TABS[number]['key'];

interface LessonPageProps {
    lesson: Lesson | null;
    currentCourse: LessonCourse;
    currentModule: LessonModule;
}

const LessonPage: React.FC<LessonPageProps> = ({ lesson, currentCourse, currentModule }) => {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<TabKey>('lesson');

    // Panel content for mobile
    const renderMobilePanel = () => {
        if (activeTab === 'lesson') {
            return lesson && (
                <LessonContent
                    key={lesson.id}
                    lesson={lesson}
                    currentCourseId={currentCourse.id}
                    currentModuleId={currentModule.id}
                />
            );
        }
        if (activeTab === 'code') {
            return <CodePanel />;
        }
        if (activeTab === 'output') {
            return <ExecutionPanel />;
        }
        return null;
    };

    return (
        <div className="h-full w-full p-0 md:p-6 relative overflow-hidden">
            {isMobile ? (
                <>
                    <div
                        className="absolute left-0 right-0"
                        style={{
                            top: 0,
                            bottom: '4rem', // leave space for tab bar
                            height: 'calc(100vh - 4rem - 4rem)', // header + tab bar
                            marginTop: '4rem', // header height
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {renderMobilePanel()}
                    </div>
                    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around items-center h-16 md:hidden">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`flex-1 h-full flex flex-col items-center justify-center text-xs font-medium transition-colors ${activeTab === tab.key ? 'text-blue-600' : 'text-slate-500'}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </>
            ) : (
                <div className="group/lesson h-full">
                    <PanelGroup direction="horizontal" className="h-full">
                        {/* Left: Lesson Content (1/3) */}
                        <Panel defaultSize={33.33} minSize={25}>
                            <div className="h-full">
                                {lesson && (
                                    <LessonContent
                                        key={lesson.id}
                                        lesson={lesson}
                                        currentCourseId={currentCourse.id}
                                        currentModuleId={currentModule.id}
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
            )}
        </div>
    );
};

export { LessonPage }; 