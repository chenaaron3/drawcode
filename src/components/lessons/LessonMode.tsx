import React, { useEffect } from 'react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
// Import the lesson data
import lessonModulesData from '@/data/lesson-modules.json';
import lessonProblemsData from '@/data/lesson-problems.json';
import { useLessonNavigation } from '@/hooks/useLessonNavigation';
import { useTraceStore } from '@/store/traceStore';
import { trackLessonViewed } from '@/utils/analytics';

import { LessonPage } from './LessonPage';
import { LessonSidebar } from './LessonSidebar';

import type { LessonModule, Lesson } from '@/types/lesson';
interface LessonModeProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
}

const LessonMode: React.FC<LessonModeProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const { setCurrentProblem, setMode } = useTraceStore();
    const { gotoDefaultLesson, currentLesson, currentCourse, currentModule } = useLessonNavigation();

    const handleLessonSelect = (lessonId: string) => {
        setCurrentProblem(lessonId);
        setIsSidebarOpen(false); // Close drawer after selection
    };

    useEffect(() => {
        // If there is no selected lesson, set the first lesson of the first module of the first course
        if (!currentLesson) {
            gotoDefaultLesson();
        }
        else {
            // Track analytics for the lesson
            trackLessonViewed(currentLesson.id, currentCourse?.id || '', currentModule?.id || '');
            // For a new lesson, set the designated mode
            if (currentLesson.mode !== undefined) {
                setMode(currentLesson.mode);
            }
        }
    }, [currentLesson]);

    if (!currentLesson || !currentModule || !currentCourse) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Select a lesson to get started
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            {/* Sheet Drawer */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="min-w-[20rem] max-w-[24rem] p-0 flex flex-col">
                    <SheetHeader className="mx-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <SheetTitle className="text-lg font-semibold">{currentCourse.title}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 px-6 py-4 overflow-y-auto">
                        <LessonSidebar
                            currentLesson={currentLesson}
                            currentCourse={currentCourse}
                            currentModule={currentModule}
                            modules={lessonModulesData as LessonModule[]}
                            lessons={lessonProblemsData as Lesson[]}
                            onLessonSelect={handleLessonSelect}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Main Content - Full Width */}
            <div className="h-full w-full">
                {currentLesson ? (
                    <LessonPage
                        lesson={currentLesson}
                        currentCourse={currentCourse}
                        currentModule={currentModule}
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