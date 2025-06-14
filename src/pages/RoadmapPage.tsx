import { Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import RoadmapGraph from '@/components/problems/RoadmapGraph';

import patternsData from '../data/patterns.json';
import problemDescriptionsData from '../data/problem-descriptions.json';
import problemsData from '../data/problems.json';
import { useProgress } from '../hooks/useProgress';
import { useTraceStore } from '../store/traceStore';
import { trackProblemCompletion, trackProblemSelection } from '../utils/analytics';

import type { ProblemDescription } from '../types/problem';
interface Pattern {
    id: string;
    name: string;
    description: string;
    problemIds: string[];
    dependencies: string[];
    difficulty: string;
    estimatedHours: number;
}

interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    number?: number;
}

const RoadmapPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const { toggleProblemCompletion, progress } = useProgress();
    const { setCurrentProblem } = useTraceStore();

    const handleProblemClick = useCallback((problemId: string) => {
        setCurrentProblem(problemId);
        trackProblemSelection(problemId, 'roadmap');
        // Navigation happens automatically via ProblemMode checking the store
    }, [setCurrentProblem]);

    const handleProblemToggleCompletion = useCallback((problemId: string) => {
        const wasCompleted = progress.completedProblems.includes(problemId);
        toggleProblemCompletion(problemId);
        trackProblemCompletion(problemId, !wasCompleted);
    }, [toggleProblemCompletion, progress.completedProblems]);

    // Process patterns and problems data
    const { patterns, problems } = useMemo(() => {
        const patterns: Pattern[] = patternsData.patterns;

        // Create a map of problem descriptions for quick lookup
        const problemDescriptions = problemDescriptionsData as Record<string, ProblemDescription>;

        // Transform problems data to include difficulty from descriptions
        const problems: Problem[] = problemsData.problems
            .filter(problem => problem.id !== 'sandbox') // Exclude sandbox
            .map(problem => {
                const description = problemDescriptions[problem.id];
                return {
                    id: problem.id,
                    title: problem.title,
                    difficulty: (description?.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy',
                    number: problem.number,
                };
            });

        return { patterns, problems };
    }, []);

    useEffect(() => {
        // Simulate loading time for better UX
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading roadmap...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-background">
            <RoadmapGraph
                patterns={patterns}
                problems={problems}
                onProblemClick={handleProblemClick}
                onProblemToggleCompletion={handleProblemToggleCompletion}
            />
        </div>
    );
};

export default RoadmapPage; 