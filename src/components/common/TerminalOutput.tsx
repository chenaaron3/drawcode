import { AnimatePresence, motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useTerminalOutput } from '../../hooks/useTerminalOutput';

// New reusable content component
export const TerminalOutputContent: React.FC = () => {
    const { terminalOutput } = useTerminalOutput();
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    return <div className="relative flex-1 min-h-0">
        <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full flex-1 min-h-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-md font-mono text-xs overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
        >
            {terminalOutput.length === 0 ? (
                <div className="text-muted-foreground text-center flex justify-center items-center h-full">
                    No console output yet...
                </div>
            ) : (
                <AnimatePresence>
                    {terminalOutput.map((output, index) => (
                        <motion.div
                            key={index}
                            className="mb-1 last:mb-0"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="text-muted-foreground">Line {output.line}:</span> {output.output}
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>

        {/* Fade indicator when scrolled */}
        {isScrolled && (
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent lg:pointer-events-none rounded-t-md" />
        )}
    </div>
};

const TerminalOutput: React.FC = () => {
    return (
        <Card className="w-full h-full flex flex-col" data-tutorial="terminal-panel">
            <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
                <TerminalOutputContent />
            </CardContent>
        </Card>
    );
};

export default TerminalOutput; 