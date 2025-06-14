import React, { useEffect, useState } from 'react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
// Import the lesson data
import lessonCoursesData from '@/data/lesson-courses.json';
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
    const [courses] = useState(lessonCoursesData.courses);
    // Default to the first course (intro-to-python)
    const currentCourse = courses[0];
    // Filter modules and lessons for the current course
    const allModules = lessonModulesData.modules as LessonModule[];
    const modules = allModules.filter(m => currentCourse.moduleIds.includes(m.id));
    const allLessons = lessonProblemsData as Lesson[];
    // Only include lessons that are in the modules of the current course
    const lessons = allLessons.filter(lesson =>
        modules.some(module => module.lessonIds.includes(lesson.id))
    );

    const selectedLessonId = getCurrentProblemId();

    // Default to first lesson if no problem is selected
    useEffect(() => {
        if (!selectedLessonId && lessons.length > 0) {
            setCurrentProblem(lessons[0].id);
        }
    }, [lessons, selectedLessonId, setCurrentProblem]);

    const selectedLesson = lessons.find(l => l.id === selectedLessonId);
    const currentModule = modules.find(module => module.lessonIds.includes(selectedLessonId ?? ""));
    const currentModuleId = currentModule ? currentModule.id : undefined;
    const currentCourseId = currentCourse.id;

    const handleLessonSelect = (lessonId: string) => {
        setCurrentProblem(lessonId);
        setIsSidebarOpen(false); // Close drawer after selection
    };

    if (!selectedLessonId || !currentModuleId || !currentCourseId) {
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
                <SheetContent side="left" className="w-80 sm:max-w-80 p-0 flex flex-col">
                    <SheetHeader className="mx-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <SheetTitle className="text-lg font-semibold">Python Fundamentals</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 px-6 py-4 overflow-y-auto">
                        <LessonSidebar
                            modules={modules}
                            lessons={lessons}
                            currentCourseId={currentCourseId}
                            currentModuleId={currentModuleId}
                            selectedLessonId={selectedLessonId}
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
                        currentCourseId={currentCourseId}
                        currentModuleId={currentModuleId ?? ""}
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