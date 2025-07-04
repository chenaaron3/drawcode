import { SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { MdRefresh, MdShare } from 'react-icons/md';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useTraceGeneration } from '@/hooks/useTraceGeneration';
import { useTraceStore } from '@/store/traceStore';

export function SettingControls() {
    const {
        lineIndex,
        isPlaying,
        playSpeed,
        mode,
        setMode,
        setPlaySpeed,
        reset,
        currentCode,
        hasChanges,
        resetToOriginal,
        getCurrentProblemId,
        getCurrentProblemData,
        clearError,
    } = useTraceStore();

    const { generateTraceFromState, isGenerating } = useTraceGeneration();

    const currentProblemId = getCurrentProblemId();
    const problemData = currentProblemId ? getCurrentProblemData(currentProblemId) : null;

    const [shareLoading, setShareLoading] = useState(false);

    // Handle reset to original
    const handleReset = () => {
        resetToOriginal();
        clearError();
    };

    // Handle update (generate new trace)
    const handleUpdate = async () => {
        if (!currentCode) return;
        await generateTraceFromState();
    };

    // Handle sharing link - either problem ID or code depending on mode
    const handleShareLink = async () => {
        setShareLoading(true);
        try {
            let shareUrl: string;
            let toastMessage: string;

            if (currentProblemId === 'sandbox') {
                // Sandbox mode: share the code
                if (!currentCode) {
                    toast.error('No code to share');
                    return;
                }
                const encodedCode = btoa(encodeURIComponent(currentCode));
                shareUrl = `${window.location.origin}${window.location.pathname}?code=${encodedCode}`;
                toastMessage = 'Code link copied to clipboard!';
            } else {
                // Regular problem: share the problem ID
                if (!currentProblemId) {
                    toast.error('No problem to share');
                    return;
                }
                shareUrl = `${window.location.origin}${window.location.pathname}?problemId=${currentProblemId}`;
                const problemTitle = problemData?.title || currentProblemId;
                toastMessage = `Problem link copied! Share "${problemTitle}"`;
            }

            // Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);
            toast.success(toastMessage);
        } catch (err) {
            console.error('Failed to copy share link:', err);
            toast.error('Failed to copy share link');
        } finally {
            setShareLoading(false);
        }
    };

    // If there are changes, show change detection controls
    if (hasChanges) {
        return (
            <div className="flex items-center gap-2">
                {!isGenerating && <div className="hidden lg:visible lg:flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-1.5">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-800 font-medium">
                        Unsaved changes
                    </span>
                </div>}
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
                    data-testid="compile-button"
                >
                    {isGenerating ? "Updating..." : 'Update'}
                </Button>
            </div >
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="absolute right-2 lg:relative lg:right-0" variant="outline" size="sm" data-tutorial="settings-button" data-testid="settings-button">
                    <SettingsIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navigation Mode</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => setMode("line")}
                >
                    <div className="flex items-center justify-between w-full">
                        <span>Line Mode</span>
                        {mode === "line" && <span className="text-xs text-primary">●</span>}
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setMode("step")}
                >
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
                            <SelectItem value="1000">0.5× (Slow)</SelectItem>
                            <SelectItem value="750">1× (Normal)</SelectItem>
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
                    disabled={shareLoading || (currentProblemId === 'sandbox' && !currentCode) || (!currentProblemId)}
                    data-testid="share-menu-item"
                >
                    <MdShare className="mr-2 h-4 w-4" />
                    {shareLoading ? 'Sharing...' : currentProblemId === 'sandbox' ? 'Share Code' : 'Share Problem'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 