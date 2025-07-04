import { motion } from 'framer-motion';
import {
    ArrowRight, BookOpen, ChevronRight, Github, Menu, Newspaper, Play, Zap
} from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
    {
        id: 'blog' as const,
        label: 'Blog',
        icon: Newspaper,
        problemId: null,
    },
] as const;

export const Header: React.FC = () => {
    const router = useRouter();
    const { getCurrentProblemId, getCurrentProblemData, setCurrentProblem } = useTraceStore();
    const { setSidebarOpen } = useAppStore();
    const currentProblemId = getCurrentProblemId();
    const currentProblem = currentProblemId ? getCurrentProblemData(currentProblemId) : null;
    const { data: session } = useSession();

    const handleModeChange = (mode: typeof navigationModes[number]) => {
        router.push(`/${mode.id}`);
        if (mode.problemId) {
            setCurrentProblem(mode.problemId);
        }
        // Close sidebar when switching tabs
        setSidebarOpen(false);
    };

    const isCurrentPath = (path: string) => {
        const firstComponent = router.pathname.split('/')[1] || '';
        return firstComponent === path;
    };

    // Only show the Lessons button on lesson detail pages
    const showLessonsButton =
        router.pathname === '/lesson/[course]/[module]/[lesson]' &&
        !!router.query.course &&
        !!router.query.module &&
        !!router.query.lesson;

    const isLandingPage = isCurrentPath('');

    const onGetStarted = async () => {
        router.push("/lesson")
    };

    return (
        <header className="top-0 left-0 right-0 h-12 md:h-16 bg-white border-b border-gray-200 px-3 md:px-6 flex-shrink-0 z-40">
            <div className="flex items-center justify-between h-full">
                {/* Logo and Title */}
                <div className="flex items-center gap-3 md:gap-6" data-tutorial="logo" >
                    <div className="cursor-pointer  flex items-center gap-2 md:gap-3" onClick={() => router.push('/')}>
                        <div className="visible w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="hidden lg:inline text-base md:text-xl font-bold text-gray-900">
                            CodeViz
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
                            <div
                                className="absolute left-1/2 -translate-x-1/2 flex bg-gray-100 rounded-lg p-1 lg:relative lg:left-0 lg:translate-x-0"
                                data-tutorial="navigation-tabs"
                            >
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
                            {/* Profile Avatar Button - rightmost */}
                            {session?.user?.image && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="ml-2 focus:outline-none rounded-full border border-gray-200 hover:ring-2 hover:ring-blue-400 transition-shadow">
                                            <Avatar>
                                                <AvatarImage
                                                    src={session.user.image}
                                                    alt={session.user.name || 'Profile'}
                                                />
                                                <AvatarFallback>
                                                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={async () => {
                                                await signOut({ callbackUrl: '/' });
                                            }}
                                        >
                                            Sign out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}; 