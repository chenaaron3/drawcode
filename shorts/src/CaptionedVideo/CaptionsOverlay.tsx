import React from 'react';
import { Sequence } from 'remotion';

import SubtitlePage from './SubtitlePage';

const CaptionsOverlay: React.FC<{
    pages: any[];
    fps: number;
    captionsStartFrame: number;
    SWITCH_CAPTIONS_EVERY_MS: number;
}> = ({ pages, fps, captionsStartFrame, SWITCH_CAPTIONS_EVERY_MS }) => {
    return (
        <>
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
                if (subtitleStartFrame < captionsStartFrame) {
                    return null;
                }
                return (
                    <Sequence
                        key={index}
                        from={subtitleStartFrame}
                        durationInFrames={durationInFrames}
                    >
                        <SubtitlePage key={index} page={page} />
                    </Sequence>
                );
            })}
        </>
    );
};

export default CaptionsOverlay; 