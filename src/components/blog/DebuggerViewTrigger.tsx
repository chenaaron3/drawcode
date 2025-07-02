'use client';

import { motion, useInView } from 'framer-motion';
import { CheckCircle, Play } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useTraceStore } from '@/store/traceStore';

interface DebuggerViewTriggerProps {
    problemId: string;
}

export const DebuggerViewTrigger = ({ problemId }: DebuggerViewTriggerProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const setCurrentProblem = useTraceStore((state) => state.setCurrentProblem);
    const currentProblemId = useTraceStore((state) => state.currentProblemId);
    const isInView = useInView(ref, { amount: 0.5 }); // 50% visible

    const isActive = currentProblemId === problemId;

    // useEffect(() => {
    //     if (isInView) {
    //         setCurrentProblem(problemId);
    //     }
    // }, [isInView, problemId, setCurrentProblem]);

    // Visible indicator for markdown: a small animated badge
    return (
        <motion.span
            onClick={() => setCurrentProblem(problemId)}
            ref={ref}
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{
                opacity: isInView ? 1 : 0.3,
                scale: isInView ? 1.1 : 0.8,
                boxShadow: isActive
                    ? '0 0 0 4px #00e676, 0 2px 8px rgba(0,188,212,0.15)'
                    : isInView
                        ? '0 2px 8px rgba(0,188,212,0.15)'
                        : 'none',
            }}
            transition={{ duration: 0.4, type: 'spring' }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                margin: '16px 0',
                padding: '4px 12px',
                borderRadius: 8,
                background: isActive
                    ? '#e8f5e9'
                    : isInView
                        ? '#e0f7fa'
                        : '#f0f0f0',
                border: isActive
                    ? '2px solid #00e676'
                    : isInView
                        ? '2px solid #00bcd4'
                        : '1px solid #ccc',
                width: 'fit-content',
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? '#2e7d32' : '#007c91',
                cursor: 'pointer',
                userSelect: 'none',
                position: 'relative',
            }}
            aria-label={`Debugger trigger for problem ${problemId}`}
        >
            <span className='flex justify-center items-center gap-2'>
                <Play className="h-4 w-4" />{isActive ? 'Active in Editor' : 'Copy to Editor'}
            </span>
        </motion.span>
    );
}; 