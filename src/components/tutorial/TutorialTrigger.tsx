import { HelpCircle } from 'lucide-react';
import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useTraceStore } from '@/store/traceStore';

import { useTutorialStore } from '../../store/tutorialStore';

export const TutorialTrigger: React.FC = () => {
    const {
        isActive,
        hasSeenTutorial,
        startTutorial,
    } = useTutorialStore();
    const { currentTab } = useTraceStore();

    // Auto-start tutorial for first-time users
    useEffect(() => {
        if (!hasSeenTutorial && !isActive) {
            // Small delay to ensure the page is fully loaded
            const timer = setTimeout(() => {
                startTutorial();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [hasSeenTutorial, isActive, startTutorial]);

    // Disable on mobile
    // if (typeof window !== 'undefined' && window.innerWidth < 768) {
    //     return null;
    // }
    // Hide if not in learn mode
    if (currentTab !== 'learn' && currentTab !== 'playground') {
        return null;
    }

    return <Button
        variant="ghost"
        size="icon"
        className="text-gray-600 hover:text-gray-900"
        onClick={() => startTutorial()}
    >
        <HelpCircle className="h-4 w-4" />
    </Button>
}; 