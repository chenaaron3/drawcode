import { AnimatePresence, motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useTraceStore } from '../store/traceStore';

interface TerminalOutput {
    line: number;
    output: string;
}

const TerminalOutputOverlay: React.FC = () => {
    const { traceData, lineIndex, stepIndex } = useTraceStore();
    const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([]);

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
                if (step.focus && step.focus.includes('print(') && step.event === 'after_statement') {
                    const output = extractPrintOutput(step.focus, traceLine.locals);
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

    // Helper function to extract print output
    const extractPrintOutput = (printExpression: string, locals: Record<string, any>): string => {
        try {
            // Extract the content inside print()
            const match = printExpression.match(/print\((.*)\)$/);
            if (!match) return '';

            const args = match[1].trim();
            if (!args) return ''; // Empty print()

            // Handle different argument patterns
            const result: string[] = [];

            // Split by comma, but be careful with quotes
            const parts = splitPrintArgs(args);

            for (const part of parts) {
                const trimmed = part.trim();

                if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
                    // Single-quoted string literal
                    result.push(trimmed.slice(1, -1));
                } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                    // Double-quoted string literal
                    result.push(trimmed.slice(1, -1));
                } else if (locals[trimmed] !== undefined) {
                    // Variable reference
                    result.push(String(locals[trimmed]));
                } else {
                    // Handle simple expressions or literals
                    const numericValue = Number(trimmed);
                    if (!isNaN(numericValue)) {
                        result.push(trimmed); // Numeric literal
                    } else {
                        result.push(trimmed); // Fallback
                    }
                }
            }

            return result.join(' ');
        } catch (error) {
            return '';
        }
    };

    // Helper function to split print arguments respecting quotes
    const splitPrintArgs = (args: string): string[] => {
        const parts: string[] = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < args.length; i++) {
            const char = args[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
                current += char;
            } else if (char === ',' && !inQuotes) {
                parts.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        if (current) {
            parts.push(current);
        }

        return parts;
    };

    // Don't show overlay if there's no output
    if (terminalOutput.length === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                className="absolute bottom-4 right-4 w-80 z-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="shadow-lg border-slate-300 dark:border-slate-600">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Terminal className="w-4 h-4" />
                            Output
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="bg-black text-green-400 p-3 rounded-md font-mono text-xs max-h-48 overflow-y-auto">
                            <AnimatePresence>
                                {terminalOutput.map((output, index) => (
                                    <motion.div
                                        key={index}
                                        className="mb-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.2 }}
                                    >
                                        <span className="text-gray-500">Line {output.line}:</span> {output.output}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};

export default TerminalOutputOverlay; 