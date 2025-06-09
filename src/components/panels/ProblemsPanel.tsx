import { motion } from 'framer-motion';
import { CheckCircle, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { useProgress } from '../../hooks/useProgress';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    number?: number;
}

interface Pattern {
    id: string;
    name: string;
    description: string;
    problemIds: string[];
    dependencies: string[];
    difficulty: string;
    estimatedHours: number;
}

interface ProblemsPanelProps {
    selectedPattern: Pattern | null;
    problems: Problem[];
    onClearFilter: () => void;
    onProblemClick: (problemId: string) => void;
    onProblemToggleCompletion: (problemId: string) => void;
}

// Simple fuzzy search implementation
const fuzzySearch = (query: string, text: string): boolean => {
    if (!query) return true;

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // Direct substring match gets highest priority
    if (textLower.includes(queryLower)) return true;

    // Fuzzy match - characters in order but not necessarily consecutive
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
        if (textLower[i] === queryLower[queryIndex]) {
            queryIndex++;
        }
    }
    return queryIndex === queryLower.length;
};

const ProblemsPanel: React.FC<ProblemsPanelProps> = ({
    selectedPattern,
    problems,
    onClearFilter,
    onProblemClick,
    onProblemToggleCompletion,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { isProblemCompleted } = useProgress();

    // Get the base problem set (all problems or pattern-filtered problems)
    const baseProblems = useMemo(() => {
        if (selectedPattern) {
            // Filter to pattern problems
            return selectedPattern.problemIds
                .map(id => problems.find(p => p.id === id))
                .filter(Boolean) as Problem[];
        } else {
            // Show all problems
            return problems;
        }
    }, [selectedPattern, problems]);

    // Clear search when a pattern is selected
    React.useEffect(() => {
        if (selectedPattern) {
            setSearchQuery('');
        }
    }, [selectedPattern]);

    // Apply search filter and sort
    const filteredProblems = useMemo(() => {
        let filtered = baseProblems;

        // Apply search filter (only when no pattern is selected)
        if (!selectedPattern && searchQuery.trim()) {
            filtered = baseProblems.filter(problem => {
                const searchIn = `${problem.title} ${problem.number || ''}`.trim();
                return fuzzySearch(searchQuery, searchIn);
            });
        }

        // Sort by number
        return filtered
            .sort((a, b) => {
                // Sort by number, putting problems without numbers at the end
                if (a.number == null && b.number == null) return 0;
                if (a.number == null) return 1;
                if (b.number == null) return -1;
                return a.number - b.number;
            })
    }, [baseProblems, searchQuery, selectedPattern]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <Card className="w-80 shadow-lg flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">
                                {selectedPattern ? selectedPattern.name : 'All Problems'}
                            </CardTitle>
                            {selectedPattern && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${selectedPattern.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                    selectedPattern.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {selectedPattern.difficulty.charAt(0).toUpperCase() + selectedPattern.difficulty.slice(1)}
                                </span>
                            )}
                        </div>
                        {selectedPattern && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearFilter}
                                className="h-6 w-6 p-0"
                                title="Clear filter"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {selectedPattern && (
                        <p className="text-xs text-muted-foreground">{selectedPattern.description}</p>
                    )}

                    {/* Search Input - Only show when viewing all problems */}
                    {!selectedPattern && (
                        <div className="relative mt-2">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search all problems..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 text-sm"
                            />
                        </div>
                    )}

                    {/* Results Count */}
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>
                            {selectedPattern ?
                                `${baseProblems.length} problems` :
                                `${filteredProblems.length} of ${baseProblems.length} problems`
                            }
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 overflow-y-auto">
                    <div className="space-y-2">
                        {filteredProblems.map((problem) => {
                            const isCompleted = isProblemCompleted(problem.id);
                            const difficultyColor =
                                problem.difficulty === 'Easy' ? 'text-green-600' :
                                    problem.difficulty === 'Medium' ? 'text-yellow-600' :
                                        'text-red-600';

                            return (
                                <div
                                    key={problem.id}
                                    className={`p-2 rounded border cursor-pointer transition-all hover:shadow-md ${isCompleted ? 'bg-green-50 border-green-200 ring-1 ring-green-300' : 'bg-card border-border hover:bg-accent'
                                        }`}
                                    onClick={() => onProblemClick(problem.id)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        onProblemToggleCompletion(problem.id);
                                    }}
                                    title={`Click to solve • Right-click to mark as ${isCompleted ? 'incomplete' : 'complete'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium truncate">
                                                    {problem.title}
                                                </span>
                                                {isCompleted && (
                                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs font-medium ${difficultyColor}`}>
                                                    {problem.difficulty}
                                                </span>
                                                {problem.number && (
                                                    <span className="text-xs text-muted-foreground">
                                                        #{problem.number}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredProblems.length === 0 && searchQuery && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No problems found</p>
                                <p className="text-xs">Try a different search term</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ProblemsPanel; 