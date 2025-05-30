import { BsFillPauseFill, BsFillPlayFill } from 'react-icons/bs';
import { MdMoreVert, MdRefresh, MdSkipNext, MdSkipPrevious } from 'react-icons/md';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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
        reset
    } = useTraceStore();

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
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
} 