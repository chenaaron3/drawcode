import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AbsoluteFill, CalculateMetadataFunction, cancelRender, continueRender, delayRender,
    getStaticFiles, interpolate, OffthreadVideo, Sequence, useCurrentFrame, useVideoConfig,
    watchStaticFile
} from 'remotion';
import { z } from 'zod';

import { Caption, createTikTokStyleCaptions } from '@remotion/captions';
import { getVideoMetadata } from '@remotion/media-utils';

import introConfigJson from '../intro.json';
import { loadFont } from '../load-font';
import AnimatedBackground from './AnimatedBackground';
import AnimatedIntro from './AnimatedIntro';
import { NoCaptionFile } from './NoCaptionFile';
import SubtitlePage from './SubtitlePage';

type IntroConfig = Record<string, { title: string; image: string; hideIntroOnWord?: string }>;
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
  const [intro, setIntro] = useState<{ title: string; image: string; hideIntroOnWord?: string } | null>(null);
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
    const captions = subtitles.filter(c => c.text.toLowerCase().includes(lowerTarget));
    if (captions.length > 0) {
      // Find the first occurrence of targetWord (case-insensitive)
      for (let i = 0; i < captions.length - 1; i++) {
        const word = captions[i].text.toLowerCase();
        if (word.includes(lowerTarget)) {
          // Found the word, calculate average of endMs of found and startMs of next
          const foundEnd = captions[i].endMs;
          const nextStart = captions[i + 1].startMs;
          const avgMs = Math.round((foundEnd + nextStart) / 2);
          return Math.max(1, Math.floor((avgMs / 1000) * fps));
        }
      }
    }
    return INTRO_DEFAULT_DURATION_FRAMES;
  }, [intro, subtitles, fps]);

  // Crossfade logic
  const transitionDuration = 20;
  const fadeStart = introDurationInFrames;
  const fadeEnd = introDurationInFrames + transitionDuration;
  const introFade = frame < fadeStart
    ? 1
    : frame >= fadeEnd
      ? 0
      : interpolate(frame, [fadeStart, fadeEnd], [1, 0]);
  const videoFade = frame < fadeStart
    ? 0
    : frame >= fadeEnd
      ? 1
      : interpolate(frame, [fadeStart, fadeEnd], [0, 1]);

  // Calculate the frame after which to start showing captions
  const captionsStartFrame = useMemo(() => {
    if (!intro || !intro.hideIntroOnWord || !pages.length) {
      return 0;
    }
    const targetWord = intro.hideIntroOnWord.toLowerCase();
    // Use regex for whole word match, case-insensitive
    const wordRegex = new RegExp(`\\b${targetWord}\\b`, 'i');
    for (let i = 0; i < pages.length; i++) {
      if (wordRegex.test(pages[i].text)) {
        // Hide up to and including this caption, so start after its end
        const nextPage = pages[i + 1];
        // Calculate endMs for this page
        const tokens = pages[i].tokens;
        const pageEndMs = tokens && tokens.length > 0
          ? Math.max(...tokens.map(t => t.toMs))
          : pages[i].startMs;
        // If next page exists, start at its startMs; otherwise, after this page's end
        const startMs = nextPage ? nextPage.startMs : pageEndMs;
        return Math.floor((startMs / 1000) * fps);
      }
    }
    return 0; // If not found, show all captions
  }, [intro, pages, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AnimatedBackground />
      {intro && (
        <Sequence from={0} durationInFrames={introDurationInFrames}>
          <AnimatedIntro title={intro.title} image={intro.image} fadeOut={introFade} />
        </Sequence>
      )}
      <AbsoluteFill style={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
        <OffthreadVideo
          style={{
            width: "70%",
            height: "auto", objectFit: "cover", objectPosition: "center", borderRadius: 50, opacity: videoFade, transition: 'opacity 0.3s',
            transform: "translateY(40%)"
          }}
          src={src}
        />
      </AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = (page.startMs / 1000) * fps;
        const subtitleEndFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          subtitleStartFrame + SWITCH_CAPTIONS_EVERY_MS,
        );
        const durationInFrames = subtitleEndFrame - subtitleStartFrame;
        if (durationInFrames <= 0) {
          return null;
        }
        // Only show captions after the calculated start frame
        if (subtitleStartFrame < captionsStartFrame) {
          return null;
        }
        return (
          <Sequence
            key={index}
            from={subtitleStartFrame}
            durationInFrames={durationInFrames}
          >
            <SubtitlePage key={index} page={page} />;
          </Sequence>
        );
      })}
      {getFileExists(subtitlesFile) ? null : <NoCaptionFile />}
    </AbsoluteFill>
  );
};
