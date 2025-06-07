import { motion } from 'framer-motion';
import { GripVertical, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { useTraceStore } from '../store/traceStore';
import PythonTutorVariablePanel from './PythonTutorVariablePanel';

export default function DraggableVariablePanel() {
    const { toggleOverlayMode } = useTraceStore();
    const [isMinimized, setIsMinimized] = useState(false);
    const [size, setSize] = useState({ width: 650, height: 420 }); // 28rem x 24rem
    const [isResizing, setIsResizing] = useState(false);
    const [resizeTrigger, setResizeTrigger] = useState(0);
    const panelRef = useRef<HTMLDivElement>(null);

    // Calculate and set initial position for right side placement
    const [position, setPosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        // Center in the right half of the code editor area
        // Crude calculation: right half starts at 50% viewport width
        // Center of right half is at 75% of viewport width
        const rightHalfCenterX = (window.innerWidth * 0.75) - (size.width / 2);

        // Center vertically in viewport
        const centerY = (window.innerHeight / 2) - (size.height / 2);

        // Ensure it doesn't go off-screen
        const clampedX = Math.max(50, Math.min(rightHalfCenterX, window.innerWidth - size.width - 50));
        const clampedY = Math.max(50, Math.min(centerY, window.innerHeight - size.height - 50));

        setPosition({ x: clampedX, y: clampedY });
    }, [size.width, size.height]); // Update when panel size changes

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent drag from starting
        setIsResizing(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(320, startWidth + (e.clientX - startX));
            const newHeight = Math.max(320, startHeight + (e.clientY - startY));

            setSize({
                width: Math.min(newWidth, window.innerWidth * 0.9),
                height: Math.min(newHeight, window.innerHeight * 0.8)
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            setResizeTrigger(prev => prev + 1); // Trigger React Flow resize
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [size]);

    // Cleanup effect to ensure resizing stops if component unmounts
    useEffect(() => {
        return () => {
            setIsResizing(false);
        };
    }, []);

    console.log('DraggableVariablePanel rendering');

    return (
        <motion.div
            ref={panelRef}
            drag={!isResizing} // Disable drag when resizing
            dragMomentum={false}
            dragElastic={0}
            animate={position}
            className="fixed top-0 left-0 z-60"
            style={{
                cursor: isResizing ? 'nw-resize' : 'grab',
                width: size.width,
                height: size.height
            }}
            whileDrag={{
                cursor: 'grabbing',
                scale: 1.02,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
        >
            <Card className="bg-white border-2 border-blue-500 shadow-lg h-full flex flex-col relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-grab flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-medium">Variables</h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="h-6 w-6 p-0"
                        >
                            <span className="text-xs">
                                {isMinimized ? '□' : '_'}
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleOverlayMode}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </CardHeader>
                {!isMinimized && (
                    <CardContent className="pt-0 flex-1 min-h-0">
                        <div className="h-full w-full">
                            <PythonTutorVariablePanel resizeTrigger={resizeTrigger} />
                        </div>
                    </CardContent>
                )}

                {/* Resize handle */}
                {!isMinimized && (
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity z-10"
                        onMouseDown={handleMouseDown}
                        style={{
                            background: 'linear-gradient(-45deg, transparent 30%, #cbd5e1 30%, #cbd5e1 40%, transparent 40%, transparent 60%, #cbd5e1 60%, #cbd5e1 70%, transparent 70%)',
                        }}
                    />
                )}
            </Card>
        </motion.div>
    );
} 