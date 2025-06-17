import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Menu, Play, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { useTraceStore } from '@/store/traceStore';

import { LessonMode } from '../lessons';
import { TutorialTrigger } from '../tutorial';

// Navigation configuration for scalability
const navigationModes = [
    {
        id: 'learn' as const,
        label: 'Learn',
        icon: BookOpen,
        problemId: null,
    },
    // {
    //     id: 'practice' as const,
    //     label: 'Practice',
    //     icon: Code,
    //     problemId: null,
    // },
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
        <div className="w-screen h-screen max-w-full max-h-screen overflow-hidden bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-12 md:h-16 bg-white border-b border-gray-200 px-3 md:px-6 flex-shrink-0 z-40">
                <div className="flex items-center justify-between h-full">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-3 md:gap-6" data-tutorial="logo">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-base md:text-xl font-bold text-gray-900">
                                Python Quest
                            </h1>
                        </div>
                        {/* Lessons button - always show, icon-only on mobile, icon+text on desktop */}
                        {currentTab === 'learn' && (
                            <>
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="flex md:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Lessons"
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                                >
                                    <Menu className="h-4 w-4" />
                                    Lessons
                                </button>
                            </>
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
                    <div className="flex items-center gap-2 md:gap-4">
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
                                            className={`relative z-20 flex items-center justify-center md:gap-2 px-2 md:px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive
                                                ? 'text-white'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5 md:h-4 md:w-4" />
                                            <span className="hidden md:inline">{mode.label}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden max-h-full m-4 lg:m-0 lg:pt-16" style={{ height: 'calc(100vh - 4rem)' }}>
                {currentTab === 'learn' && (
                    <LessonMode
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                    />
                )}
            </main>
        </div>
    );
};

export default MainLayout; 