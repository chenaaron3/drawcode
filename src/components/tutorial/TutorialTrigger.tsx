import { HelpCircle } from 'lucide-react';
import { useRouter } from 'next/router';
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
    const router = useRouter();

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

    // Hide if not in learn mode
    if (router.pathname !== '/lesson' && router.pathname !== '/sandbox') {
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