import { Loader2 } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import lessonProblemsJson from '@/data/lesson-problems.json';
import problemDescriptionsData from '@/data/problem-descriptions.json';
import problemsJson from '@/data/problems.json';
import { useCodeInitialization } from '@/hooks/useCodeInitialization';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useTraceStore } from '@/store/traceStore';
import { initGA, trackPageView } from '@/utils/analytics';

import { Header } from './Header';

import type { ProblemDescription, Problem } from '@/types/problem';
const MainLayout: React.FC = () => {
    useSoundEffects();
    const { setProblemsData } = useTraceStore();
    const { isInitializing } = useCodeInitialization();
    const session = useSession();
    const router = useRouter();

    // Initialize Google Analytics and load problems data
    useEffect(() => {
        // Initialize Google Analytics
        initGA();

        // Track initial page view
        trackPageView('/app', 'Python Visualizer - Interactive Learning Platform');

        const loadProblemsWithDescriptions = async () => {
            try {
                const problemDescriptions = problemDescriptionsData as Record<string, ProblemDescription>;

                // Combine regular problems and lesson problems
                const allProblems = [...problemsJson.problems, ...lessonProblemsJson];

                // Join problems with descriptions (check both problem and lesson descriptions)
                const problemsWithDetails = allProblems.map(problem => ({
                    ...problem,
                    details: problemDescriptions[problem.id] || null
                })) as Problem[];

                setProblemsData(problemsWithDetails);
            } catch (error) {
                console.error('Error loading problem descriptions:', error);
                // Fallback to just the problems data without descriptions
                const allProblems = [...problemsJson.problems, ...lessonProblemsJson];
                const problemsWithoutDetails = allProblems.map(problem => ({
                    ...problem,
                    details: null
                })) as any[];
                setProblemsData(problemsWithoutDetails);
            }
        };

        loadProblemsWithDescriptions();
    }, [setProblemsData]);

    let isAuthorizing = false;
    // only require sign in on lesson page
    if (router.pathname === "/lesson") {
        if (session.status == 'unauthenticated') {
            isAuthorizing = true;
            signIn('google');
        } else if (session.status == 'loading') {
            isAuthorizing = true;
        }
    }

    if (isInitializing || isAuthorizing) {
        return (
            <div className="fixed inset-0 z-60 bg-gray-900 bg-opacity-40 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
        );
    }

    return (
        <Header />
    );
};

export default MainLayout; 