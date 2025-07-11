import { title } from 'process';
import { useCallback, useEffect, useMemo, useState } from 'react';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark';
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

export const AutoplayVideo: React.FC<{
  src: string;
}> = ({ src }) => {
  const frame = useCurrentFrame();

  // Frame boundaries for overlays
  const transitionDuration = 20;
  const introEnd = 40;

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AnimatedBackground />
      {/* Audio from src plays throughout */}
      <IntroOverlay
        frame={frame}
        startFrame={0}
        endFrame={Infinity}
        transition={transitionDuration}
        title={"Can you guess what this code does?"}
      />
      <OffthreadVideo
        src={src}
        style={{ display: 'none' }}
        playbackRate={1}
        muted={false}
      />
      <MainVideoOverlay
        src={src}
        frame={frame}
        startFrame={0}
        transition={transitionDuration}
      />
    </AbsoluteFill>
  );
};
