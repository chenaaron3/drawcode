import { motion } from 'framer-motion';
import { BsFillPauseFill, BsFillPlayFill } from 'react-icons/bs';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';

import { Button } from '@/components/ui/button';

import { useTraceStore } from '../store/traceStore';

export function NavigationControls() {
    const {
        lineIndex,
        isPlaying,
        hasNext,
        prev,
        togglePlay,
        next,
        hasChanges
    } = useTraceStore();

    // Hide navigation controls when there are unsaved changes
    if (hasChanges) {
        return null;
    }

    // Essential Navigation Controls only
    return (
        <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{
                // top: 0,
                // left: 0,
                // right: 400,
                // bottom: 200
            }}
            className="flex items-center gap-2 p-1.5 bg-background border border-border rounded-lg shadow-lg cursor-grab active:cursor-grabbing touch-none"
            whileDrag={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                zIndex: 9999
            }}
        >
            <Button
                variant="outline"
                size="sm"
                onClick={prev}
                disabled={lineIndex === 0 || isPlaying}
                className="h-8 w-8 p-0 border-2 hover:border-primary hover:bg-primary/5 disabled:opacity-50 shadow-sm transition-all duration-200"
            >
                <MdSkipPrevious className="h-4 w-4" />
            </Button>

            <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={togglePlay}
                disabled={!hasNext() && !isPlaying}
                className={`h-9 w-9 p-0 border-2 shadow-md transition-all duration-200 ${isPlaying
                    ? "bg-primary hover:bg-primary/90 border-primary text-primary-foreground shadow-lg"
                    : "border-2 hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                    }`}
            >
                {isPlaying ? <BsFillPauseFill className="h-5 w-5" /> : <BsFillPlayFill className="h-5 w-5" />}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={next}
                disabled={!hasNext() || isPlaying}
                className="h-8 w-8 p-0 border-2 hover:border-primary hover:bg-primary/5 disabled:opacity-50 shadow-sm transition-all duration-200"
            >
                <MdSkipNext className="h-4 w-4" />
            </Button>
        </motion.div>
    );
} 