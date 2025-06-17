import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronRight, Github, Menu, Play, Zap } from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { useTraceStore } from '@/store/traceStore';

import { TutorialTrigger } from '../tutorial';

// Navigation configuration for scalability
const navigationModes = [
    {
        id: 'lesson' as const,
        label: 'Learn',
        icon: BookOpen,
        problemId: null,
    },
    {
        id: 'sandbox' as const,
        label: 'Play',
        icon: Play,
        problemId: 'sandbox',
    },
] as const;

interface HeaderProps {
}

export const Header: React.FC<HeaderProps> = () => {
    const router = useRouter();
    const { getCurrentProblemId, getCurrentProblemData, setCurrentProblem } = useTraceStore();
    const { setSidebarOpen } = useAppStore();
    const currentProblemId = getCurrentProblemId();
    const currentProblem = currentProblemId ? getCurrentProblemData(currentProblemId) : null;

    const handleModeChange = (mode: typeof navigationModes[number]) => {
        router.push(`/${mode.id}`);
        setCurrentProblem(mode.problemId);
        // Close sidebar when switching tabs
        setSidebarOpen(false);
    };

    const handleBackToProblems = () => {
        router.push('/roadmap');
        setCurrentProblem(null);
    };

    const isCurrentPath = (path: string) => {
        const firstComponent = router.pathname.split('/')[1] || '';
        return firstComponent === path;
    };
    const showLessonsButton = isCurrentPath('lesson');
    const isLandingPage = isCurrentPath('');

    const onGetStarted = () => {
        router.push('/lesson');
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-12 md:h-16 bg-white border-b border-gray-200 px-3 md:px-6 flex-shrink-0 z-40">
            <div className="flex items-center justify-between h-full">
                {/* Logo and Title */}
                <div className="flex items-center gap-3 md:gap-6" data-tutorial="logo" >
                    <div className="cursor-pointer  flex items-center gap-2 md:gap-3" onClick={() => router.push('/')}>
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-base md:text-xl font-bold text-gray-900">
                            Python Quest
                        </h1>
                    </div>
                    {/* Lessons button - only show if enabled and in learn mode */}
                    {showLessonsButton && isCurrentPath('lesson') && (
                        <>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="flex cursor-pointer md:hidden items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Lessons"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="hidden cursor-pointer md:flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                            >
                                <Menu className="h-4 w-4" />
                                Lessons
                            </button>
                        </>
                    )}
                </div>

                {/* Breadcrumb Navigation - only show in practice mode with selected problem (not sandbox) */}
                {isCurrentPath('roadmap') && currentProblem && currentProblemId !== 'sandbox' && (
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

                {/* Navigation - Different content based on landing page */}
                <div className="flex items-center gap-2 md:gap-4">
                    {isLandingPage ? (
                        <>
                            <Button variant="ghost" size="sm" className="text-gray-600" asChild>
                                <a href="https://github.com/chenaaron3/drawcode" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4 mr-2" />
                                    GitHub
                                </a>
                            </Button>
                            <Button onClick={onGetStarted} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                Get Started
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <TutorialTrigger />
                            <div className="flex bg-gray-100 rounded-lg p-1 relative" data-tutorial="navigation-tabs">
                                {navigationModes.map((mode) => {
                                    const Icon = mode.icon;
                                    const isActive = isCurrentPath(mode.id);
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
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}; 