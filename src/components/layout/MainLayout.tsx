import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Code, Menu, Play, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { useTraceStore } from '@/store/traceStore';

import { LessonMode } from '../lessons';
import { ProblemMode } from '../problems';
import { TutorialTrigger } from '../tutorial';

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
        label: 'Play',
        icon: Play,
        problemId: 'sandbox',
    },
] as const;

const MainLayout: React.FC = () => {
    const { currentTab, setCurrentTab, getCurrentProblemId, getCurrentProblemData, setCurrentProblem } = useTraceStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const currentProblemId = getCurrentProblemId();
    const currentProblem = currentProblemId ? getCurrentProblemData(currentProblemId) : null;

    const handleModeChange = (mode: typeof navigationModes[number]) => {
        setCurrentTab(mode.id);
        setCurrentProblem(mode.problemId);
        // Close sidebar when switching tabs
        setIsSidebarOpen(false);
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
                    <div className="flex items-center gap-6" data-tutorial="logo">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Python Quest
                            </h1>
                        </div>

                        {/* Lessons button - only show in learn mode */}
                        {currentTab === 'learn' && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                            >
                                <Menu className="h-4 w-4" />
                                Lessons
                            </button>
                        )}
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
                        <TutorialTrigger />
                        <div className="flex bg-gray-100 rounded-lg p-1 relative" data-tutorial="navigation-tabs">
                            {navigationModes.map((mode) => {
                                const Icon = mode.icon;
                                const isActive = currentTab === mode.id;

                                return (
                                    <div key={mode.id} className="relative z-0">
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-blue-600 rounded-md shadow-sm z-0"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 30
                                                }}
                                            />
                                        )}
                                        <button
                                            onClick={() => handleModeChange(mode)}
                                            className={`relative z-20 flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive
                                                ? 'text-white'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {mode.label}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden h-0">
                {currentTab === 'learn' ? (
                    <LessonMode
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                    />
                ) : (
                    <ProblemMode />
                )}
            </main>
        </div>
    );
};

export default MainLayout; 