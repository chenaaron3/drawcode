import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { BsFillPauseFill, BsFillPlayFill } from 'react-icons/bs';
import { MdMoreVert, MdRefresh, MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { selectCurrentLine, useTraceStore } from '../store/traceStore';

export default function CodePanel() {
    const {
        traceData,
        lineIndex,
        maxLine,
        isPlaying,
        playSpeed,
        mode,
        setIsPlaying,
        setPlaySpeed,
        setMode,
        reset,
        prev,
        next,
        togglePlay
    } = useTraceStore();
    const current = useTraceStore(selectCurrentLine);

    // Handle auto-play
    useEffect(() => {
        let intervalId: number | null = null;

        if (isPlaying && traceData) {
            intervalId = window.setInterval(() => {
                console.log(lineIndex, traceData.trace.length);
                if (lineIndex >= traceData.trace.length - 1) {
                    setIsPlaying(false);
                } else {
                    next();
                }
            }, playSpeed);
        }

        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [isPlaying, playSpeed, traceData, lineIndex, setIsPlaying, next]);

    if (!traceData || !current) return null;

    const formatFunctionName = (name: string) => {
        return name
            .split(/(?=[A-Z])|_/)
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <TooltipProvider>
            <div className="flex-1">
                {/* Code */}
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                                {formatFunctionName(traceData.metadata.function)}
                            </CardTitle>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="cursor-help">
                                        inputs
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="space-y-1">
                                        <p className="font-medium text-xs">Function Inputs:</p>
                                        <div className="space-y-0.5">
                                            {Object.entries(traceData.metadata.inputs.kwargs).map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-1 font-mono text-xs">
                                                    <span className="font-semibold">{key}</span>
                                                    <span className="text-muted-foreground">=</span>
                                                    <span>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Integrated Controls */}
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
                                disabled={lineIndex === maxLine}
                            >
                                {isPlaying ? <BsFillPauseFill className="h-4 w-4" /> : <BsFillPlayFill className="h-4 w-4" />}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={next}
                                disabled={lineIndex === maxLine || isPlaying}
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
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <div className="rounded-md overflow-hidden bg-muted/30 h-full">
                            <SyntaxHighlighter
                                language="python"
                                style={oneLight}
                                customStyle={{
                                    margin: 0,
                                    padding: 0,
                                    background: 'transparent',
                                    fontSize: '0.875rem',
                                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                    height: 'calc(100vh - 280px)',
                                    overflow: 'auto',
                                }}
                                showLineNumbers={true}
                                lineNumberStyle={{
                                    minWidth: '2.5rem',
                                    paddingRight: '1rem',
                                    color: '#6b7280',
                                    fontSize: '0.75rem',
                                    textAlign: 'right',
                                    userSelect: 'none',
                                }}
                                wrapLines={true}
                                lineProps={(lineNumber) => {
                                    const isCurrentLine = current.line_number === lineNumber;
                                    return {
                                        style: {
                                            display: 'block',
                                            backgroundColor: isCurrentLine ? 'rgb(219 234 254)' : 'transparent',
                                            borderLeft: isCurrentLine ? '4px solid rgb(59 130 246)' : '4px solid transparent',
                                            fontWeight: isCurrentLine ? '500' : 'normal',
                                            padding: '0.5rem 1rem',
                                            transition: 'all 0.2s ease',
                                        },
                                    };
                                }}
                            >
                                {traceData.metadata.code}
                            </SyntaxHighlighter>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
} 