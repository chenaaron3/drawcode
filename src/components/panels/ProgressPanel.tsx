import { RotateCcw, Trophy } from 'lucide-react';
import React, { useMemo } from 'react';

import { useProgress } from '../../hooks/useProgress';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ProgressPanelProps {
    allProblems: Array<{ id: string }>;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ allProblems }) => {
    const { getProgressStats, clearProgress } = useProgress();

    const progressStats = useMemo(() => {
        const allProblemIds = allProblems.map(p => p.id);
        return getProgressStats(allProblemIds);
    }, [allProblems, getProgressStats]);

    // Create simple pie chart with CSS
    const { completionPercentage } = progressStats;
    const strokeDasharray = `${completionPercentage * 2.51} ${251 - completionPercentage * 2.51}`;

    return (
        <Card className="w-80 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        Progress
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (window.confirm('Clear all progress?')) {
                                clearProgress();
                            }
                        }}
                        className="h-6 w-6 p-0"
                    >
                        <RotateCcw className="h-3 w-3" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                    {/* Pie Chart */}
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={strokeDasharray}
                                strokeLinecap="round"
                                className="text-blue-500 transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-foreground">
                                {completionPercentage}%
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center">
                            <div className="font-bold text-primary">{progressStats.completedCount}</div>
                            <div className="text-muted-foreground">Solved</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-primary">{progressStats.totalProblems}</div>
                            <div className="text-muted-foreground">Total</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProgressPanel; 