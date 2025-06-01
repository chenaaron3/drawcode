import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTraceStore } from '@/store/traceStore';

import type { ProblemDescription as ProblemDescriptionType } from '@/types/problem';

interface ProblemDescriptionProps {
    problemId: string;
}

export function ProblemDescription({ problemId }: ProblemDescriptionProps) {
    const { getCurrentProblemData } = useTraceStore();
    const [problemData, setProblemData] = useState<ProblemDescriptionType | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Don't fetch for sandbox problems
        if (problemId === 'sandbox') {
            setProblemData(null);
            return;
        }

        // Get problem data from store (includes joined details)
        const problem = getCurrentProblemData(problemId);
        if (problem?.details) {
            setProblemData(problem.details);
        } else {
            setProblemData(null);
        }
    }, [problemId, getCurrentProblemData]);

    // Don't render anything for sandbox or if no data
    if (problemId === 'sandbox' || !problemData) {
        return null;
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600';
            case 'Medium': return 'text-yellow-600';
            case 'Hard': return 'text-red-600';
            default: return 'text-muted-foreground';
        }
    };

    const formatProblemText = (text: string) => {
        // Basic formatting for the problem text
        return text
            .replace(/\\n\\n/g, '\n\n')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '  ')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
    };

    return (
        <Card className="mb-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="pb-3">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                            <div className="flex items-center gap-3">
                                {isOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold">{problemData.questionTitle}</h3>
                                    <span className={`text-sm font-medium ${getDifficultyColor(problemData.difficulty)}`}>
                                        {problemData.difficulty}
                                    </span>
                                    {problemData.topicTags && problemData.topicTags.length > 0 && (
                                        <div className="flex gap-1">
                                            {problemData.topicTags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag.slug}
                                                    className="text-xs bg-muted px-2 py-1 rounded"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {problemData.link && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(problemData.link, '_blank');
                                    }}
                                    className="ml-2"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            )}
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="pt-0">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>👍 {problemData.likes}</span>
                                <span>👎 {problemData.dislikes}</span>
                            </div>

                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: formatProblemText(problemData.question)
                                }}
                            />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
} 