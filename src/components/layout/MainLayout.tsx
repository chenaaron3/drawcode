import React, { useEffect } from 'react';

import lessonProblemsJson from '@/data/lesson-problems.json';
import problemDescriptionsData from '@/data/problem-descriptions.json';
import problemsJson from '@/data/problems.json';
import { useCodeInitialization } from '@/hooks/useCodeInitialization';
import { useTraceStore } from '@/store/traceStore';
import { initGA, trackPageView } from '@/utils/analytics';

import { Header } from './Header';

import type { ProblemDescription, Problem } from '@/types/problem';

const MainLayout: React.FC = () => {
    const { setProblemsData } = useTraceStore();
    const { isInitializing } = useCodeInitialization();

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

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Initializing...</p>
                </div>
            </div>
        );
    }

    return (
        <Header />
    );
};

export default MainLayout; 