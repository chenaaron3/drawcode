import { useEffect } from 'react';
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
        mode,
        playSpeed,
        traceData
    } = useTraceStore();
    const setIsEditing = useTraceStore(s => s.setIsEditing);
    const isEditing = useTraceStore(s => s.isEditing);

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

    // Handle auto-play
    useEffect(() => {
        let intervalId: number | null = null;

        if (isPlaying && traceData) {
            intervalId = window.setInterval(() => {
                next();
            }, playSpeed);
        }

        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [isPlaying, playSpeed, traceData, next]);

    // Keyboard shortcuts: left (prev), right (next), space (play/pause)
    useEffect(() => {
        if (isEditing) return; // Only listen when not editing
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    handlePrev();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleNext();
                    break;
                case ' ':
                case 'Spacebar': // for older browsers
                    e.preventDefault();
                    handleTogglePlay();
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEditing, handlePrev, handleNext, handleTogglePlay]);

    // Hide navigation controls when there are unsaved changes
    if (hasChanges) {
        return null;
    }

    // Essential Navigation Controls only
    return (
        <div className="flex items-center gap-1" data-tutorial="step-controls" onClick={() => setIsEditing(false)}>
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