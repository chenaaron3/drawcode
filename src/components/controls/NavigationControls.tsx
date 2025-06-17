import { BsFillPauseFill, BsFillPlayFill } from 'react-icons/bs';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';

import { Button } from '@/components/ui/button';
import { useTraceStore } from '@/store/traceStore';
import { trackNavigationStep, trackPlaybackControl } from '@/utils/analytics';

export function NavigationControls() {
    const {
        isPlaying,
        hasNext,
        hasPrev,
        prev,
        togglePlay,
        next,
        hasChanges,
        mode
    } = useTraceStore();

    const handlePrev = () => {
        trackNavigationStep('prev', mode);
        prev();
    };

    const handleNext = () => {
        trackNavigationStep('next', mode);
        next();
    };

    const handleTogglePlay = () => {
        trackPlaybackControl(isPlaying ? 'pause' : 'play');
        togglePlay();
    };

    // Hide navigation controls when there are unsaved changes
    if (hasChanges) {
        return null;
    }

    // Essential Navigation Controls only
    return (
        <div className="flex items-center gap-1" data-tutorial="step-controls">
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={!hasPrev() || isPlaying}
                data-testid="prev-button"
            >
                <MdSkipPrevious className="h-4 w-4" />
            </Button>

            <Button
                variant={"default"}
                size="sm"
                onClick={handleTogglePlay}
                disabled={!hasNext() && !isPlaying}
                data-testid="play-button"
            >
                {isPlaying ? <BsFillPauseFill className="h-4 w-4" /> : <BsFillPlayFill className="h-4 w-4" />}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!hasNext() || isPlaying}
                data-testid="next-button"
            >
                <MdSkipNext className="h-4 w-4" />
            </Button>
        </div>
    );
} 