'use client';

import { useEffect, useRef } from 'react';

import { useTraceStore } from '@/store/traceStore';

interface DebuggerViewTriggerProps {
    problemId: string;
}

export const DebuggerViewTrigger = ({ problemId }: DebuggerViewTriggerProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const setCurrentProblem = useTraceStore((state) => state.setCurrentProblem);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry && entry.isIntersecting) {
                    setCurrentProblem(problemId);
                }
            },
            {
                root: null, // observe viewport
                rootMargin: '0px',
                threshold: 0.5, // Trigger when 50% of the element is visible
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [problemId, setCurrentProblem]);

    // This is an invisible trigger component
    return <div ref={ref} style={{ height: '1px' }} />;
}; 