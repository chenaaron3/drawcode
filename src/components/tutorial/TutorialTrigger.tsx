import { HelpCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';

import { useTutorialStore } from '../../store/tutorialStore';

export const TutorialTrigger: React.FC = () => {
    const {
        isActive,
        hasSeenTutorial,
        advertiseTutorial,
        invokeTutorial,
    } = useTutorialStore();
    const router = useRouter();

    // Determine current page for tutorial
    const getCurrentPage = () => {
        if (router.pathname === '/lesson') return 'lesson';
        if (router.pathname === '/sandbox') return 'sandbox';
        return null;
    };

    const currentPage = getCurrentPage();

    // Auto-start tutorial for first-time users on this page
    useEffect(() => {
        if (currentPage && !hasSeenTutorial[currentPage] && !isActive) {
            // Small delay to ensure the page is fully loaded
            const timer = setTimeout(() => {
                advertiseTutorial(currentPage);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentPage, hasSeenTutorial, isActive, advertiseTutorial]);

    // Hide if not in learn mode
    if (!currentPage) {
        return null;
    }

    return <Button
        variant="ghost"
        size="icon"
        className="text-gray-600 hover:text-gray-900"
        onClick={() => invokeTutorial(currentPage)}
    >
        <HelpCircle className="h-4 w-4" />
    </Button>
}; 