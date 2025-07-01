'use client';

import { motion, useInView } from 'framer-motion';
import { Play } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useTraceStore } from '@/store/traceStore';

interface DebuggerViewTriggerProps {
    problemId: string;
}

export const DebuggerViewTrigger = ({ problemId }: DebuggerViewTriggerProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const setCurrentProblem = useTraceStore((state) => state.setCurrentProblem);
    const isInView = useInView(ref, { amount: 0.5 }); // 50% visible

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
            animate={{ opacity: isInView ? 1 : 0.3, scale: isInView ? 1.1 : 0.8 }}
            transition={{ duration: 0.4, type: 'spring' }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                margin: '16px 0',
                padding: '4px 12px',
                borderRadius: 8,
                background: isInView ? '#e0f7fa' : '#f0f0f0',
                border: isInView ? '2px solid #00bcd4' : '1px solid #ccc',
                boxShadow: isInView ? '0 2px 8px rgba(0,188,212,0.15)' : 'none',
                width: 'fit-content',
                fontSize: 14,
                fontWeight: 500,
                color: '#007c91',
                cursor: 'pointer',
                userSelect: 'none',
            }}
            aria-label={`Debugger trigger for problem ${problemId}`}
        >
            <span className='flex justify-center items-center gap-2'>
                <Play className="h-4 w-4" />Show in Debugger
            </span>
        </motion.span>
    );
}; 