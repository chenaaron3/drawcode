import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { TikTokPage } from '@remotion/captions';

import { Page } from './Page';

const SubtitlePage: React.FC<{ readonly page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 5,
  });

  return (
    <AbsoluteFill>
      <Page enterProgress={enter} page={page} />
    </AbsoluteFill>
  );
};

export default SubtitlePage;
