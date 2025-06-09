import { AnimatePresence, motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useTerminalOutput } from '../../hooks/useTerminalOutput';

const TerminalOutput: React.FC = () => {
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



    // Don't show if there's no output
    if (terminalOutput.length === 0) {
        return null;
    }

    return (
        <Card className="w-full mb-4 h-full">
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
                        className="bg-slate-900 dark:bg-slate-800 text-green-400 p-3 rounded-md font-mono text-xs max-h-25 overflow-y-auto hover:scrollbar-thumb-green-500 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-transparent"
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
                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900 dark:from-slate-800 to-transparent pointer-events-none rounded-t-md" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TerminalOutput; 