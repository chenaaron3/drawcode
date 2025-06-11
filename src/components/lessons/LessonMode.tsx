import React, { useEffect, useState } from 'react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
// Import the lesson data
import lessonModulesData from '@/data/lesson-modules.json';
import lessonProblemsData from '@/data/lesson-problems.json';
import { useTraceStore } from '@/store/traceStore';

import { LessonPage } from './LessonPage';
import { LessonSidebar } from './LessonSidebar';

import type { LessonModule, Lesson } from '@/types/lesson';

interface LessonModeProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
}

const LessonMode: React.FC<LessonModeProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
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

    const handleLessonSelect = (lessonId: string) => {
        setCurrentProblem(lessonId);
        setIsSidebarOpen(false); // Close drawer after selection
    };

    return (
        <div className="h-full w-full relative">
            {/* Sheet Drawer */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="w-80 sm:max-w-80 p-0 flex flex-col">
                    <SheetHeader className="mx-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <SheetTitle className="text-lg font-semibold">Python Fundamentals</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 px-6 py-4 overflow-y-auto">
                        <LessonSidebar
                            modules={modules}
                            lessons={lessons}
                            selectedLessonId={selectedLessonId || undefined}
                            onLessonSelect={handleLessonSelect}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Main Content - Full Width */}
            <div className="h-full w-full">
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