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
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={prev}
                disabled={lineIndex === 0 || isPlaying}
            >
                <MdSkipPrevious className="h-4 w-4" />
            </Button>

            <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={togglePlay}
                disabled={!hasNext() && !isPlaying}
            >
                {isPlaying ? <BsFillPauseFill className="h-4 w-4" /> : <BsFillPlayFill className="h-4 w-4" />}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={next}
                disabled={!hasNext() || isPlaying}
            >
                <MdSkipNext className="h-4 w-4" />
            </Button>
        </div>
    );
} 