import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AbsoluteFill, cancelRender, continueRender, delayRender, getStaticFiles, OffthreadVideo,
    Sequence, staticFile, useCurrentFrame, useVideoConfig, watchStaticFile
} from 'remotion';
import { z } from 'zod';

import { createTikTokStyleCaptions } from '@remotion/captions';
import { getVideoMetadata } from '@remotion/media-utils';

import AnimatedBackground from '../Components/AnimatedBackground';
import CaptionsOverlay from '../Components/CaptionsOverlay';
import IntroOverlay from '../Components/IntroOverlay';
import MainVideoOverlay from '../Components/MainVideoOverlay';
import { NoCaptionFile } from '../Components/NoCaptionFile';
import VisualOverlay from '../Components/VisualOverlay';
import introConfigJson from '../intro.json';
import { loadFont } from '../load-font';

import type { Caption } from '@remotion/captions';
import type { CalculateMetadataFunction } from 'remotion';
type IntroConfig = Record<string, { title: string; image: string; hideIntroOnWord?: string; hideVisualOnWord?: string; visual?: string }>;
const introConfig: IntroConfig = introConfigJson;

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
const SWITCH_CAPTIONS_EVERY_MS = 750;
const INTRO_DEFAULT_DURATION_FRAMES = 60;

export const CaptionedVideo: React.FC<{
  src: string;
}> = ({ src }) => {
  const [subtitles, setSubtitles] = useState<Caption[]>([]);
  const [intro, setIntro] = useState<{ title: string; image: string; hideIntroOnWord?: string; hideVisualOnWord?: string; visual?: string } | null>(null);
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

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

  useEffect(() => {
    const base = src.split("/").pop();
    if (base && introConfig[base]) {
      setIntro(introConfig[base]);
    } else {
      setIntro(null);
    }
  }, [src]);

  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      captions: subtitles ?? [],
    });
  }, [subtitles]);

  // Calculate intro duration based on first occurrence of hideIntroOnWord
  const introDurationInFrames = useMemo(() => {
    if (!intro || !intro.hideIntroOnWord || !subtitles.length) {
      return INTRO_DEFAULT_DURATION_FRAMES;
    }
    const targetWord = intro.hideIntroOnWord.toLowerCase();
    const lowerTarget = targetWord.toLowerCase();
    const captions = subtitles;
    if (captions.length > 0) {
      // Find the first occurrence of targetWord (case-insensitive)
      for (let i = 0; i < captions.length - 1; i++) {
        const word = captions[i]!.text.toLowerCase();
        if (word.includes(lowerTarget)) {
          // Found the word, calculate average of endMs of found and startMs of next
          const foundEnd = captions[i]!.endMs;
          const nextStart = captions[i + 1]!.startMs;
          const avgMs = Math.round((foundEnd + nextStart) / 2);
          return Math.max(1, Math.floor((avgMs / 1000) * fps));
        }
      }
    }
    return INTRO_DEFAULT_DURATION_FRAMES;
  }, [intro, subtitles, fps]);

  // Calculate visual duration based on first occurrence of hideVisualOnWord
  const visualDurationInFrames = useMemo(() => {
    if (!intro || !intro.hideVisualOnWord || !subtitles.length) {
      return 0;
    }
    const targetWord = intro.hideVisualOnWord.toLowerCase();
    const lowerTarget = targetWord.toLowerCase();
    const captions = subtitles;
    if (captions.length > 0) {
      for (let i = 0; i < captions.length - 1; i++) {
        const word = captions[i].text.toLowerCase();
        if (word.includes(lowerTarget)) {
          const foundEnd = captions[i].endMs;
          const nextStart = captions[i + 1].startMs;
          const avgMs = Math.round((foundEnd + nextStart) / 2);
          return Math.max(1, Math.floor((avgMs / 1000) * fps));
        }
      }
    }
    return 0;
  }, [intro, subtitles, fps]);

  // Frame boundaries for overlays
  const transitionDuration = 20;
  const introStart = 0;
  const introEnd = introDurationInFrames;
  const visualStart = introEnd;
  const visualEnd = visualDurationInFrames > introEnd ? visualDurationInFrames : introEnd;
  const mainStart = visualEnd;

  // Calculate the frame after which to start showing captions (after intro)
  const captionsStartFrame = useMemo(() => {
    if (!intro || !intro.hideIntroOnWord || !subtitles.length) {
      return 0;
    }
    const targetWord = intro.hideIntroOnWord.toLowerCase();
    const wordRegex = new RegExp(`\\b${targetWord}\\b`, 'i');
    for (let i = 0; i < subtitles.length; i++) {
      if (wordRegex.test(subtitles[i].text)) {
        const nextSubtitle = subtitles[i + 1];
        const subtitleEndMs = subtitles[i].endMs;
        const startMs = nextSubtitle ? nextSubtitle.startMs : subtitleEndMs;
        return Math.floor((startMs / 1000) * fps);
      }
    }
    return 0;
  }, [intro, subtitles, fps]);

  // Visual video src
  const visualSrc = staticFile(intro?.visual ?? '');

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AnimatedBackground />
      {/* Audio from src plays throughout */}
      <OffthreadVideo
        src={src}
        style={{ display: 'none' }}
        playbackRate={1}
        muted={false}
      />
      {/* 1. Intro overlay */}
      {intro && (
        <Sequence from={introStart} durationInFrames={introEnd - introStart + transitionDuration}>
          <IntroOverlay
            frame={frame}
            startFrame={introStart}
            endFrame={introEnd}
            transition={transitionDuration}
            title={intro.title}
            image={intro.image}
          />
        </Sequence>
      )}
      {/* 2. Visual overlay */}
      {visualEnd > visualStart && (
        <Sequence from={visualStart} durationInFrames={visualEnd - visualStart + transitionDuration}>
          <VisualOverlay
            src={visualSrc}
            frame={frame}
            startFrame={visualStart}
            endFrame={visualEnd}
            transition={transitionDuration}
          />
        </Sequence>
      )}
      {/* 3. Main video overlay */}
      <Sequence from={mainStart} durationInFrames={Infinity}>
        <MainVideoOverlay
          src={src}
          frame={frame}
          startFrame={mainStart}
          transition={transitionDuration}
          trim={true}
        />
      </Sequence>
      {/* Captions visible after intro */}
      <CaptionsOverlay
        pages={pages}
        fps={fps}
        captionsStartFrame={captionsStartFrame}
        SWITCH_CAPTIONS_EVERY_MS={SWITCH_CAPTIONS_EVERY_MS}
      />
      {getFileExists(subtitlesFile) ? null : <NoCaptionFile />}
    </AbsoluteFill>
  );
};
