import { AnimatePresence, motion, steps } from 'framer-motion';
import { Terminal } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useTraceStore } from '../store/traceStore';

interface TerminalOutput {
    line: number;
    output: string;
}

const TerminalOutput: React.FC = () => {
    const { traceData, lineIndex, stepIndex } = useTraceStore();
    const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!traceData) {
            setTerminalOutput([]);
            return;
        }

        // Extract print statements and their outputs from the trace
        const outputs: TerminalOutput[] = [];

        // Go through each trace line up to the current position
        for (let i = 0; i <= lineIndex && i < traceData.trace.length; i++) {
            const traceLine = traceData.trace[i];

            // Determine how many steps to check on this line
            const stepsToCheck = i === lineIndex ? stepIndex + 1 : traceLine.steps.length;

            // Look through the steps we've executed on this line
            for (let stepIdx = 0; stepIdx < stepsToCheck && stepIdx < traceLine.steps.length; stepIdx++) {
                const step = traceLine.steps[stepIdx];

                // Only add to terminal when we reach the after_statement of a print
                if (step.focus && step.focus.startsWith('print(') && step.event === 'after_statement') {
                    const output = extractPrintOutputFromSteps(traceLine.steps, stepIdx);
                    if (output) {
                        outputs.push({
                            line: traceLine.line_number,
                            output: output
                        });
                    }
                }
            }
        }

        setTerminalOutput(outputs);
    }, [traceData, lineIndex, stepIndex]);

    // Auto-scroll to bottom when new output is added
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [terminalOutput]);

    // Handle scroll events to show/hide fade indicator
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            setIsScrolled(scrollContainerRef.current.scrollTop > 0);
        }
    };

    // Helper function to extract print output from trace steps
    const extractPrintOutputFromSteps = (steps: any[], printStatementIndex: number): string => {
        try {
            const values: string[] = [];

            // Look backwards from the print statement to find the argument values
            for (let i = printStatementIndex - 1; i >= 0; i--) {
                const step = steps[i];

                // Stop when we hit the print's before_expression (start of this print call)
                if (step.focus && step.focus.includes('print(') && step.event === 'before_expression') {
                    break;
                }

                // Collect after_expression values (these are the print arguments)
                if (step.event === 'after_expression' && step.value !== undefined) {
                    // Add to the beginning since we're going backwards
                    values.unshift(String(step.value));
                }
            }

            return values.join(' ');
        } catch (error) {
            return '';
        }
    };

    // Don't show if there's no output
    if (terminalOutput.length === 0) {
        return null;
    }

    return (
        <Card className="w-full border-slate-300 dark:border-slate-600 mb-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Console Output
                    {terminalOutput.length > 6 && (
                        <span className="text-xs text-slate-500 ml-auto">
                            {terminalOutput.length} lines
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="relative">
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="bg-black text-green-400 p-3 rounded-md font-mono text-xs max-h-25 overflow-y-auto hover:scrollbar-thumb-green-500 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-transparent"
                    >
                        <AnimatePresence>
                            {terminalOutput.map((output, index) => (
                                <motion.div
                                    key={index}
                                    className="mb-1 last:mb-0"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span className="text-gray-500">Line {output.line}:</span> {output.output}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Fade indicator when scrolled */}
                    {isScrolled && (
                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent pointer-events-none rounded-t-md" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TerminalOutput; 