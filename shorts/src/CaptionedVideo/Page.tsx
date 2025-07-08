import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { makeTransform, scale, translateY } from '@remotion/animation-utils';
import { TikTokPage } from '@remotion/captions';
import { fitText } from '@remotion/layout-utils';

import { TheBoldFont } from '../load-font';

const fontFamily = TheBoldFont;

const DESIRED_FONT_SIZE = 120;
const HIGHLIGHT_COLOR = "#39E508";

export const Page: React.FC<{
  readonly enterProgress: number;
  readonly page: TikTokPage;
}> = ({ enterProgress, page }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;

  const fontSize = 100;

  return (
    <AbsoluteFill
      style={{
        position: "absolute",
        left: "50%",
        top: "70%",
        transform: "translate(-50%, 0%)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize,
          color: "white",
          WebkitTextStroke: "20px black",
          paintOrder: "stroke",
          transform: makeTransform([
            scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
            translateY(interpolate(enterProgress, [0, 1], [50, 0])),
          ]),
          fontFamily,
          textTransform: "uppercase",
          maxWidth: width * 0.75, // 75% of video width
          whiteSpace: "normal",
          wordBreak: "break-word",
          textAlign: "center",
        }}
      >
        <span>
          {page.tokens.map((t) => {
            const startRelativeToSequence = t.fromMs - page.startMs;
            const endRelativeToSequence = t.toMs - page.startMs;

            const active =
              startRelativeToSequence <= timeInMs &&
              endRelativeToSequence > timeInMs;

            return (
              <span
                key={t.fromMs}
                style={{
                  display: "inline",
                  whiteSpace: "pre",
                  color: active ? HIGHLIGHT_COLOR : "white",
                }}
              >
                {t.text}
              </span>
            );
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};
