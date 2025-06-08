import {
    BookOpen, Brain, CheckCircle, Clock, Code, Lightbulb, Pause, Play, SkipBack, SkipForward
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Progress component inline since it doesn't exist in UI library
import { useLessons } from '@/hooks/useLessons';
import { useLessonStore } from '@/store/lessonStore';

import type { LessonStepType } from '@/types/lesson';

// Icon mapping for EDGE methodology steps
const STEP_ICONS: Record<LessonStepType, React.ReactNode> = {
    explain: <BookOpen className="h-4 w-4" />,
    demonstrate: <Play className="h-4 w-4" />,
    guide: <Brain className="h-4 w-4" />,
    enable: <Code className="h-4 w-4" />
};

// Color scheme for different step types
const STEP_COLORS: Record<LessonStepType, string> = {
    explain: "bg-blue-50 border-blue-200 text-blue-800",
    demonstrate: "bg-orange-50 border-orange-200 text-orange-800",
    guide: "bg-green-50 border-green-200 text-green-800",
    enable: "bg-purple-50 border-purple-200 text-purple-800"
};

interface LessonPlayerProps {
    className?: string;
}

export default function LessonPlayer({ className }: LessonPlayerProps) {
    const {
        currentLesson,
        currentStep,
        currentStepIndex,
        nextStep,
        previousStep,
        canAdvanceToNextStep,
        completeStep,
        completeLesson,
        isPlaying
    } = useLessonStore();

    // const { getNextLesson, getPreviousLesson } = useLessons(); // TODO: Use for lesson navigation

    if (!currentLesson) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Lesson Selected</h3>
                        <p className="text-muted-foreground">Choose a lesson to start learning!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const progress = ((currentStepIndex + 1) / currentLesson.steps.length) * 100;
    const canAdvance = canAdvanceToNextStep();
    const isLastStep = currentStepIndex === currentLesson.steps.length - 1;
    const isFirstStep = currentStepIndex === 0;

    const handleNextStep = () => {
        if (currentStep) {
            // Mark current step as completed
            completeStep(currentStep.id);
        }

        if (isLastStep) {
            // Complete the lesson
            completeLesson();
        } else {
            // Move to next step
            nextStep();
        }
    };

    const handlePreviousStep = () => {
        if (!isFirstStep) {
            previousStep();
        }
    };

    const getStepTypeLabel = (type: LessonStepType): string => {
        switch (type) {
            case 'explain': return 'Explain';
            case 'demonstrate': return 'Demonstrate';
            case 'guide': return 'Guide';
            case 'enable': return 'Enable';
            default: return type;
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Lesson Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">{currentLesson.title}</CardTitle>
                            <p className="text-muted-foreground mt-1">{currentLesson.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {currentLesson.estimatedTime}m
                            </Badge>
                            <Badge variant="outline">{currentLesson.difficulty}</Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{currentStepIndex + 1} of {currentLesson.steps.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Current Step */}
            {currentStep && (
                <Card className={`border-2 ${STEP_COLORS[currentStep.type]}`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            {STEP_ICONS[currentStep.type]}
                            <div>
                                <Badge variant="secondary" className="mb-1">
                                    {getStepTypeLabel(currentStep.type)}
                                </Badge>
                                <h3 className="text-lg font-semibold">{currentStep.title}</h3>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{currentStep.content}</p>
                        </div>

                        {/* Step-specific content */}
                        {currentStep.type === 'demonstrate' && currentStep.tooltips && (
                            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <h4 className="font-medium text-orange-800 mb-2">Watch Points:</h4>
                                <ul className="space-y-1 text-sm text-orange-700">
                                    {currentStep.tooltips.map((tooltip) => (
                                        <li key={tooltip.id}>• {tooltip.content}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {currentStep.type === 'guide' && currentStep.quiz && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-800 mb-2">Quiz Question:</h4>
                                <p className="text-sm text-green-700">{currentStep.quiz.question}</p>
                                {/* TODO: Add quiz component here */}
                            </div>
                        )}

                        {currentStep.type === 'enable' && currentStep.hints && (
                            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <h4 className="font-medium text-purple-800 mb-2">Hints:</h4>
                                <ul className="space-y-1 text-sm text-purple-700">
                                    {currentStep.hints.map((hint, index) => (
                                        <li key={index}>💡 {hint}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Navigation Controls */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePreviousStep}
                            disabled={isFirstStep}
                            className="flex items-center gap-2"
                        >
                            <SkipBack className="h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-2">
                            {currentLesson.steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`w-3 h-3 rounded-full ${index < currentStepIndex
                                        ? 'bg-green-500'
                                        : index === currentStepIndex
                                            ? 'bg-blue-500'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={handleNextStep}
                            disabled={!canAdvance}
                            className="flex items-center gap-2"
                        >
                            {isLastStep ? (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Complete
                                </>
                            ) : (
                                <>
                                    Next
                                    <SkipForward className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 