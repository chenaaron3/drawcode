import { Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import RoadmapGraph from '@/components/problems/RoadmapGraph';
import patternsData from '@/data/patterns.json';
import problemDescriptionsData from '@/data/problem-descriptions.json';
import problemsData from '@/data/problems.json';
import { useTraceStore } from '@/store/traceStore';
import { trackProblemCompletion, trackProblemSelection } from '@/utils/analytics';

import type { ProblemDescription } from '@/types/problem';
import type { progress } from 'framer-motion';
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
    const { setCurrentProblem } = useTraceStore();

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
            />
        </div>
    );
};

export default RoadmapPage; 