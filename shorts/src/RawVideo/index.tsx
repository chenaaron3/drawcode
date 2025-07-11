import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AbsoluteFill, cancelRender, continueRender, delayRender, getStaticFiles, OffthreadVideo,
    Sequence, staticFile, useCurrentFrame, useVideoConfig, watchStaticFile
} from 'remotion';
import { z } from 'zod';

import { createTikTokStyleCaptions } from '@remotion/captions';
import { getVideoMetadata } from '@remotion/media-utils';

import CaptionsOverlay from '../Components/CaptionsOverlay';
import { NoCaptionFile } from '../Components/NoCaptionFile';
import { loadFont } from '../load-font';

import type { Caption } from '@remotion/captions';
import type { CalculateMetadataFunction } from 'remotion';

export type SubtitleProp = {
    startInSeconds: number;
    text: string;
};

export const captionedVideoSchema = z.object({
    src: z.string(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
    z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
    const fps = 30;
    const metadata = await getVideoMetadata(props.src);

    return {
        fps,
        durationInFrames: Math.floor(metadata.durationInSeconds * fps),
    };
};

const getFileExists = (file: string) => {
    const files = getStaticFiles();
    const fileExists = files.find((f) => {
        return f.src === file;
    });
    return Boolean(fileExists);
};

// How many captions should be displayed at a time?
// Try out:
// - 1500 to display a lot of words at a time
// - 200 to only display 1 word at a time
const SWITCH_CAPTIONS_EVERY_MS = 250;

export const RawVideo: React.FC<{
    src: string;
}> = ({ src }) => {
    const [subtitles, setSubtitles] = useState<Caption[]>([]);
    const [handle] = useState(() => delayRender());
    const { fps } = useVideoConfig();

    const subtitlesFile = src
        .replace(/.mp4$/, ".json")
        .replace(/.mkv$/, ".json")
        .replace(/.mov$/, ".json")
        .replace(/.webm$/, ".json");

    const fetchSubtitles = useCallback(async () => {
        try {
            await loadFont();
            const res = await fetch(subtitlesFile);
            const data = (await res.json()) as Caption[];
            setSubtitles(data);
            continueRender(handle);
        } catch (e) {
            cancelRender(e);
        }
    }, [handle, subtitlesFile]);

    useEffect(() => {
        fetchSubtitles();
        const c = watchStaticFile(subtitlesFile, () => {
            fetchSubtitles();
        });
        return () => {
            c.cancel();
        };
    }, [fetchSubtitles, src, subtitlesFile]);

    const { pages } = useMemo(() => {
        return createTikTokStyleCaptions({
            combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
            captions: subtitles ?? [],
        });
    }, [subtitles]);

    return (
        <AbsoluteFill style={{ backgroundColor: "white" }}>
            {/* Audio from src plays throughout */}
            <OffthreadVideo
                src={src}
                playbackRate={1}
                muted={false}
            />
            <CaptionsOverlay
                pages={pages}
                fps={fps}
                captionsStartFrame={0}
                SWITCH_CAPTIONS_EVERY_MS={SWITCH_CAPTIONS_EVERY_MS}
            />
            {getFileExists(subtitlesFile) ? null : <NoCaptionFile />}
        </AbsoluteFill>
    );
};
