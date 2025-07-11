import React from 'react';
import { AbsoluteFill, OffthreadVideo } from 'remotion';

const MainVideoOverlay: React.FC<{
    src: string;
    frame: number;
    startFrame: number;
    transition: number;
    trim?: boolean;
}> = ({ src, frame, startFrame, transition, trim = false }) => {
    let fade = 1;
    if (frame < startFrame + transition) {
        fade = Math.max((frame - startFrame) / transition, 0);
    }
    return (
        <AbsoluteFill style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', opacity: fade }}>
            <OffthreadVideo
                style={{
                    width: '70%',
                    height: 'auto',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    borderRadius: 50,
                    transition: 'opacity 0.3s',
                    transform: 'translateY(55%)',
                }}
                trimBefore={trim ? startFrame : undefined}
                src={src}
                muted={true}
            />
        </AbsoluteFill>
    );
};

export default MainVideoOverlay; 