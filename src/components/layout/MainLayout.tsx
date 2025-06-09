import { BookOpen, ChevronRight, Code, Play } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useTraceStore } from '@/store/traceStore';

import { LessonMode } from '../lessons';
import { ProblemMode } from '../problems';

// Navigation configuration for scalability
const navigationModes = [
    {
        id: 'learn' as const,
        label: 'Learn',
        icon: BookOpen,
        problemId: null,
    },
    {
        id: 'practice' as const,
        label: 'Practice',
        icon: Code,
        problemId: null,
    },
    {
        id: 'playground' as const,
        label: 'Playground',
        icon: Play,
        problemId: 'sandbox',
    },
] as const;

const MainLayout: React.FC = () => {
    const { currentTab, setCurrentTab, getCurrentProblemId, getCurrentProblemData, setCurrentProblem } = useTraceStore();
    const currentProblemId = getCurrentProblemId();
    const currentProblem = currentProblemId ? getCurrentProblemData(currentProblemId) : null;

    const handleModeChange = (mode: typeof navigationModes[number]) => {
        setCurrentTab(mode.id);
        setCurrentProblem(mode.problemId);
    };

    const handleBackToProblems = () => {
        setCurrentProblem(null);
    };

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
                                Python Adventure
                            </h1>
                            <p className="text-sm text-gray-500">
                                Interactive & Visual Approach
                            </p>
                        </div>
                    </div>

                    {/* Breadcrumb Navigation - only show in practice mode with selected problem (not sandbox) */}
                    {currentTab === 'practice' && currentProblem && currentProblemId !== 'sandbox' && (
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                onClick={handleBackToProblems}
                                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                            >
                                Problems
                            </button>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900 font-medium truncate max-w-[200px]">
                                {currentProblem.title}
                            </span>
                        </div>
                    )}

                    {/* Scalable Navigation */}
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {navigationModes.map((mode) => {
                                const Icon = mode.icon;
                                const isActive = currentTab === mode.id;

                                return (
                                    <Button
                                        key={mode.id}
                                        variant={isActive ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => handleModeChange(mode)}
                                        className={`flex items-center gap-2 ${isActive
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {mode.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden h-0">
                {currentTab === 'learn' ? <LessonMode /> : <ProblemMode />}
            </main>
        </div>
    );
};

export default MainLayout; 