import { BsFillPauseFill, BsFillPlayFill } from 'react-icons/bs';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';

import { Button } from '@/components/ui/button';

import { useTraceStore } from '../store/traceStore';

export function NavigationControls() {
    const {
        isPlaying,
        hasNext,
        hasPrev,
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
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="sm"
                onClick={prev}
                disabled={!hasPrev() || isPlaying}
                data-testid="prev-button"
            >
                <MdSkipPrevious className="h-4 w-4" />
            </Button>

            <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={togglePlay}
                disabled={!hasNext() && !isPlaying}
                data-testid="play-button"
            >
                {isPlaying ? <BsFillPauseFill className="h-4 w-4" /> : <BsFillPlayFill className="h-4 w-4" />}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={next}
                disabled={!hasNext() || isPlaying}
                data-testid="next-button"
            >
                <MdSkipNext className="h-4 w-4" />
            </Button>
        </div>
    );
} 