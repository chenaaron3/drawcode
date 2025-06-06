import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import React from 'react';

import { useProgress } from '../hooks/useProgress';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
    onClose: () => void;
    onProblemClick: (problemId: string) => void;
    onProblemToggleCompletion: (problemId: string) => void;
}

const ProblemsPanel: React.FC<ProblemsPanelProps> = ({
    selectedPattern,
    problems,
    onClose,
    onProblemClick,
    onProblemToggleCompletion,
}) => {
    const { isProblemCompleted } = useProgress();

    if (!selectedPattern) return null;

    const patternProblems = selectedPattern.problemIds
        .map(id => problems.find(p => p.id === id))
        .filter(Boolean) as Problem[];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <Card className="w-80 shadow-lg max-h-96 flex flex-col">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{selectedPattern.name}</CardTitle>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${selectedPattern.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                selectedPattern.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {selectedPattern.difficulty.charAt(0).toUpperCase() + selectedPattern.difficulty.slice(1)}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedPattern.description}</p>
                </CardHeader>
                <CardContent className="pt-0 flex-1 overflow-y-auto">
                    <div className="space-y-2">
                        {patternProblems.map((problem) => {
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
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ProblemsPanel; 