import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { useTraceStore } from '../../store/traceStore';
import { useTutorialStore } from '../../store/tutorialStore';

interface ElementPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

export const TutorialOverlay: React.FC = () => {
    const {
        isActive,
        currentStepIndex,
        steps,
        nextStep,
        previousStep,
        skipTutorial,
        completeTutorial
    } = useTutorialStore();
    const router = useRouter();

    // Show tutorial on learning and play pages
    const shouldShowTutorial = (router.pathname === '/lesson' || router.pathname === '/sandbox') && isActive;

    const [targetElement, setTargetElement] = useState<ElementPosition | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const [targetBorderRadius, setTargetBorderRadius] = useState<string>('8px');

    const currentStep = steps[currentStepIndex];

    const calculatePositions = useCallback(() => {
        if (!currentStep) return;

        const element = document.querySelector(currentStep.targetSelector) as HTMLElement;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const padding = 8;

        // Get computed border-radius of the target element
        const computedStyle = window.getComputedStyle(element);
        const borderRadius = computedStyle.borderRadius || '8px';
        setTargetBorderRadius(borderRadius);

        // Target element position (for highlighting)
        setTargetElement({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
        });

        // Tooltip position - Simple and predictable
        const tooltipOffset = 20;
        const targetCenterX = rect.left + rect.width / 2;
        const targetCenterY = rect.top + rect.height / 2;
        let top = 0;
        let left = 0;

        switch (currentStep.position) {
            case 'top':
                // Tooltip's x-center aligns with target's x-center, tooltip's bottom touches target's top
                left = targetCenterX;
                top = rect.top - tooltipOffset;
                break;
            case 'bottom':
                // Tooltip's x-center aligns with target's x-center, tooltip's top touches target's bottom
                left = targetCenterX;
                top = rect.bottom + tooltipOffset;
                break;
            case 'left':
                // Tooltip's y-center aligns with target's y-center, tooltip's right touches target's left
                left = rect.left - tooltipOffset;
                top = targetCenterY;
                break;
            case 'right':
                // Tooltip's y-center aligns with target's y-center, tooltip's left touches target's right
                left = rect.right + tooltipOffset;
                top = targetCenterY;
                break;
        }

        // Add viewport bounds checking to prevent cutoff
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const tooltipWidth = 320; // max-w-sm is roughly 320px
        const tooltipHeight = 200; // estimated height
        const margin = 10; // margin from viewport edges

        // Adjust position if it would go off-screen
        switch (currentStep.position) {
            case 'top':
            case 'bottom':
                // Check horizontal bounds (tooltip extends 50% left and right from position)
                if (left - tooltipWidth / 2 < margin) {
                    left = margin + tooltipWidth / 2;
                } else if (left + tooltipWidth / 2 > viewportWidth - margin) {
                    left = viewportWidth - margin - tooltipWidth / 2;
                }
                break;
            case 'left':
                // Check if tooltip would go off left edge (tooltip extends 100% left from position)
                if (left - tooltipWidth < margin) {
                    left = rect.right + tooltipOffset; // Switch to right side
                }
                break;
            case 'right':
                // Check if tooltip would go off right edge (tooltip extends 100% right from position)
                if (left + tooltipWidth > viewportWidth - margin) {
                    left = rect.left - tooltipOffset; // Switch to left side
                }
                break;
        }

        // Check vertical bounds
        if (currentStep.position === 'top' && top - tooltipHeight < margin) {
            top = rect.bottom + tooltipOffset; // Switch to bottom
        } else if (currentStep.position === 'bottom' && top + tooltipHeight > viewportHeight - margin) {
            top = rect.top - tooltipOffset; // Switch to top
        } else if ((currentStep.position === 'left' || currentStep.position === 'right')) {
            // For left/right, ensure vertical centering doesn't cause cutoff
            if (top - tooltipHeight / 2 < margin) {
                top = margin + tooltipHeight / 2;
            } else if (top + tooltipHeight / 2 > viewportHeight - margin) {
                top = viewportHeight - margin - tooltipHeight / 2;
            }
        }


        setTooltipPosition({ top, left });
    }, [currentStep]);

    useEffect(() => {
        if (shouldShowTutorial && currentStep) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(calculatePositions, 100);
            return () => clearTimeout(timer);
        }
    }, [shouldShowTutorial, currentStep, calculatePositions]);

    useEffect(() => {
        if (shouldShowTutorial) {
            window.addEventListener('resize', calculatePositions);
            return () => window.removeEventListener('resize', calculatePositions);
        }
    }, [shouldShowTutorial, calculatePositions]);

    if (!shouldShowTutorial || !currentStep || !targetElement || !tooltipPosition) {
        return null;
    }

    const handleNext = () => {
        if (currentStepIndex === steps.length - 1) {
            completeTutorial();
        } else {
            nextStep();
        }
    };

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-60 pointer-events-none">
                {/* Gray overlay with cutout - Top */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bg-black/50"
                    style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        height: targetElement.top,
                    }}
                />

                {/* Gray overlay - Left */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bg-black/50"
                    style={{
                        top: targetElement.top,
                        left: 0,
                        width: targetElement.left,
                        height: targetElement.height,
                    }}
                />

                {/* Gray overlay - Right */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bg-black/50"
                    style={{
                        top: targetElement.top,
                        left: targetElement.left + targetElement.width,
                        right: 0,
                        height: targetElement.height,
                    }}
                />

                {/* Gray overlay - Bottom */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bg-black/50"
                    style={{
                        top: targetElement.top + targetElement.height,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />

                {/* Highlight border */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                        position: 'absolute',
                        top: targetElement.top,
                        left: targetElement.left,
                        width: targetElement.width,
                        height: targetElement.height,
                        borderRadius: targetBorderRadius,
                    }}
                    className="border-2 border-blue-400 shadow-lg shadow-blue-500/50 bg-transparent"
                />



                {/* Tooltip */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        // Positioning transforms using Framer Motion (which actually work!)
                        x: currentStep.position === 'top' || currentStep.position === 'bottom' ? '-50%' :
                            currentStep.position === 'left' ? '-100%' :
                                '0%',
                        y: currentStep.position === 'top' ? '-100%' :
                            currentStep.position === 'bottom' ? '0%' :
                                currentStep.position === 'left' || currentStep.position === 'right' ? '-50%' :
                                    '0%'
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                        position: 'absolute',
                        top: tooltipPosition.top,
                        left: tooltipPosition.left,
                    }}
                    className="pointer-events-auto max-w-sm min-w-[320px] z-60"

                >
                    <Card className="shadow-xl border-2 border-blue-200 bg-white">

                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <HelpCircle className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">{currentStep.title}</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={skipTutorial}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <div
                                className="text-sm text-gray-700 mb-4 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: currentStep.content }}
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                        {currentStepIndex + 1} of {steps.length}
                                    </span>
                                    <div className="flex gap-1">
                                        {steps.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`w-1.5 h-1.5 rounded-full ${index <= currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {currentStepIndex > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={previousStep}
                                            className="h-8"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Back
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        onClick={handleNext}
                                        className="h-8 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {currentStepIndex === steps.length - 1 ? (
                                            <>
                                                Got It!
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}; 