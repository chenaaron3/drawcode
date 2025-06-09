import { BookOpen, Code, Settings } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';

import LessonMode from './LessonMode';
import ProblemMode from './ProblemMode';

const MainLayout: React.FC = () => {
    const { isLessonMode, toggleLessonMode } = useAppStore();

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 px-6 flex-shrink-0">
                <div className="flex items-center justify-between h-full">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Code className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Learn Python
                            </h1>
                            <p className="text-sm text-gray-500">
                                Interactive & Visual Approach
                            </p>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <Button
                                variant={isLessonMode ? "default" : "ghost"}
                                size="sm"
                                onClick={() => toggleLessonMode(true)}
                                className={`flex items-center gap-2 ${isLessonMode
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <BookOpen className="h-4 w-4" />
                                Lessons
                            </Button>

                            <Button
                                variant={!isLessonMode ? "default" : "ghost"}
                                size="sm"
                                onClick={() => toggleLessonMode(false)}
                                className={`flex items-center gap-2 ${!isLessonMode
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Code className="h-4 w-4" />
                                Practice
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden h-0">
                {isLessonMode ? <LessonMode /> : <ProblemMode />}
            </main>
        </div>
    );
};

export default MainLayout; 