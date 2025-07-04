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
import {
    Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTrigger
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/useIsMobile';
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
    const isMobile = useIsMobile();
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

    const isLandingPage = isCurrentPath('');

    const onGetStarted = async () => {
        router.push("/lesson")
    };

    const MobileMenu = () => {
        return <div className="flex items-center md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <Menu className="h-6 w-6 text-gray-700" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="top" className="w-full max-w-full p-0 rounded-b-lg gap-0">
                    {session?.user?.image && (
                        <SheetHeader className="flex flex-col items-center pt-6 pb-2 px-4">

                            <div className="flex items-center justify-center w-full">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={session.user.image} alt={session.user.name || 'Profile'} />
                                    <AvatarFallback>{session.user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <span className="ml-4 text-lg font-semibold text-gray-900">{session.user.name}</span>
                            </div>
                        </SheetHeader>
                    )}
                    <div className="flex flex-col gap-2 px-4 pt-4">
                        {navigationModes.map((mode) => {
                            const Icon = mode.icon;
                            const isActive = isCurrentPath(mode.id);
                            return (
                                <SheetClose asChild key={mode.id}>
                                    <Button
                                        variant={isActive ? 'default' : 'ghost'}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-md text-base font-medium w-full justify-center ${isActive ? '' : 'text-gray-700'}`}
                                        onClick={() => handleModeChange(mode)}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{mode.label}</span>
                                    </Button>
                                </SheetClose>
                            );
                        })}
                    </div>
                    <SheetFooter className="pb-4 px-4">
                        {session?.user?.image ? (
                            <SheetClose asChild>
                                <Button
                                    variant="destructive"
                                    className="w-full flex items-center justify-center px-4 py-2 rounded-md text-base font-medium"
                                    onClick={async () => {
                                        await signOut({ callbackUrl: '/' });
                                    }}
                                >
                                    Sign out
                                </Button>
                            </SheetClose>
                        ) : <SheetClose asChild>
                            <Button
                                variant="secondary"
                                className="w-full flex items-center justify-center px-4 py-2 rounded-md text-base font-medium"
                                onClick={async () => {
                                    await signIn('google');
                                }}
                            >
                                Sign in
                            </Button>
                        </SheetClose>}
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>;
    }

    const DesktopMenu = () => {
        return <>
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
                            <Button
                                variant={isActive ? 'default' : 'ghost'}
                                className={`relative z-20 flex items-center justify-center md:gap-2 px-2 md:px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
                                onClick={() => handleModeChange(mode)}
                            >
                                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                                <span className="hidden md:inline">{mode.label}</span>
                            </Button>
                        </div>
                    );
                })}
            </div>
            {/* Profile Avatar Button - rightmost */}
            {session?.user?.image ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2 rounded-full border border-gray-200 hover:ring-2 hover:ring-blue-400 transition-shadow">
                            <Avatar>
                                <AvatarImage
                                    src={session.user.image}
                                    alt={session.user.name || 'Profile'}
                                />
                                <AvatarFallback>
                                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={async () => {
                                await signOut({ callbackUrl: '/' });
                            }}
                            className="text-red-600 focus:bg-red-50"
                        >
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button
                    variant="default"
                    className="flex items-center px-4 py-2 rounded-md text-base font-medium"
                    onClick={async () => { await signIn('google'); }}
                >
                    Sign in
                </Button>
            )}
        </>;
    }

    let navigation = <></>;
    if (isLandingPage) {
        navigation = <>
            <Button onClick={onGetStarted} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
        </>;
    } else if (isMobile) {
        navigation = <MobileMenu />;
    } else {
        navigation = <DesktopMenu />;
    }

    return (
        <header className="top-0 left-0 right-0 h-12 md:h-16 bg-white border-b border-gray-200 px-3 md:px-6 flex-shrink-0 z-40">
            <div className="flex items-center justify-between h-full">
                {/* Logo and Title */}
                <div className="flex items-center gap-3 md:gap-6" data-tutorial="logo" >
                    <div className="cursor-pointer  flex items-center gap-2 md:gap-3" onClick={() => router.push('/')}>
                        <div className="visible w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-base md:text-xl font-bold text-gray-900">
                            PyViz
                        </h1>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="items-center justify-center gap-2 md:gap-4">
                    {navigation}
                </div>
            </div>
        </header >
    );
}; 