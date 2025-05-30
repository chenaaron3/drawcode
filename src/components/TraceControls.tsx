import { useState } from 'react';
import { BsFillPauseFill, BsFillPlayFill } from 'react-icons/bs';
import { MdMoreVert, MdRefresh, MdShare, MdSkipNext, MdSkipPrevious } from 'react-icons/md';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { usePyodide } from '../hooks/usePyodide';
import { useTraceStore } from '../store/traceStore';

export function TraceControls() {
    const {
        lineIndex,
        isPlaying,
        playSpeed,
        mode,
        hasNext,
        prev,
        togglePlay,
        next,
        setMode,
        setPlaySpeed,
        reset,
        hasChanges,
        resetToOriginal,
        setTraceData,
        currentCode,
        getCurrentProblemId,
        getCurrentProblemData,
        getInputOverrides,
        traceData
    } = useTraceStore();

    const { generateTrace } = usePyodide();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentProblemId = getCurrentProblemId();
    const problemData = currentProblemId ? getCurrentProblemData(currentProblemId) : null;

    // Handle reset to original
    const handleReset = () => {
        resetToOriginal();
        setError(null);
    };

    // Handle update (generate new trace)
    const handleUpdate = async () => {
        if (!problemData || !currentCode) return;

        setIsGenerating(true);
        setError(null);

        try {
            const currentInputs = { ...traceData?.metadata.inputs.kwargs, ...getInputOverrides() };
            const newTraceData = await generateTrace(
                currentCode,
                problemData.entrypoint,
                currentInputs,
                problemData.inputs // Pass original inputs for type inference
            );

            if (newTraceData.error) {
                setError(newTraceData.error);
            } else {
                setTraceData(newTraceData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate trace');
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle share link generation
    const handleShareLink = () => {
        if (!currentCode) return;

        try {
            const encodedCode = btoa(encodeURIComponent(currentCode));

            // Use environment variable or fallback to production URL
            let baseUrl = import.meta.env.VITE_SHARE_BASE_URL;

            // If no env var is set, determine URL based on current location
            if (!baseUrl) {
                const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                baseUrl = isLocalhost
                    ? `${window.location.protocol}//${window.location.host}/`
                    : 'https://chenaaron3.github.io/drawcode/';
            }

            const shareUrl = `${baseUrl}?code=${encodedCode}`;

            // Copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Share link copied to clipboard!\n\nAnyone can use this link to view your code in the debugger.');
                console.log('Share link copied to clipboard:', shareUrl);
            }).catch(err => {
                console.error('Failed to copy to clipboard:', err);
                // Fallback: show the URL in a prompt
                const result = prompt('Your shareable link (copy this):', shareUrl);
                if (result === null) {
                    console.log('User cancelled share dialog');
                }
            });
        } catch (err) {
            console.error('Failed to generate share link:', err);
            alert('Failed to generate share link. Please try again.');
        }
    };

    // If there are changes, show change detection controls
    if (hasChanges) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-1.5">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-800 font-medium">
                        Unsaved changes
                    </span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isGenerating}
                >
                    Reset
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Updating...' : 'Update'}
                </Button>
                {error && (
                    <span className="text-sm text-red-600 ml-2">{error}</span>
                )}
            </div>
        );
    }

    // Normal trace controls
    return (
        <div className="flex items-center gap-2">
            {/* Essential Navigation Controls */}
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

            <Separator orientation="vertical" className="h-6" />

            {/* Dropdown Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <MdMoreVert className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Navigation Mode</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setMode("line")}>
                        <div className="flex items-center justify-between w-full">
                            <span>Line Mode</span>
                            {mode === "line" && <span className="text-xs text-primary">●</span>}
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMode("step")}>
                        <div className="flex items-center justify-between w-full">
                            <span>Step Mode</span>
                            {mode === "step" && <span className="text-xs text-primary">●</span>}
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                    <div className="px-2 py-1">
                        <Select
                            value={playSpeed.toString()}
                            onValueChange={(value) => setPlaySpeed(Number(value))}
                            disabled={isPlaying}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2000">0.5× (Slow)</SelectItem>
                                <SelectItem value="1000">1× (Normal)</SelectItem>
                                <SelectItem value="500">2× (Fast)</SelectItem>
                                <SelectItem value="250">4× (Very Fast)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={reset}
                        disabled={lineIndex === 0 || isPlaying}
                        className="text-destructive focus:text-destructive"
                    >
                        <MdRefresh className="mr-2 h-4 w-4" />
                        Reset to Start
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={handleShareLink}
                        disabled={!currentCode}
                    >
                        <MdShare className="mr-2 h-4 w-4" />
                        Share Link
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
} 