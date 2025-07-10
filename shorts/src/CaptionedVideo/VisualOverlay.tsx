import React from 'react';
import { AbsoluteFill, OffthreadVideo } from 'remotion';

const VisualOverlay: React.FC<{
    src: string;
    frame: number;
    startFrame: number;
    endFrame: number;
    transition: number;
}> = ({ src, frame, startFrame, endFrame, transition }) => {
    let fade = 1;
    if (frame < startFrame + transition) {
        fade = Math.min((frame - startFrame) / transition, 1);
    } else if (frame > endFrame - transition) {
        fade = 1 - Math.min((frame - (endFrame - transition)) / transition, 1);
    }
    if (fade < 0) fade = 0;
    return (
        <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: fade }}>
            <OffthreadVideo
                style={{
                    width: '60%',
                    height: 'auto',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    borderRadius: 50,
                    transition: 'opacity 0.3s',
                    transform: 'translateY(-20%)',
                }}
                src={src}
                muted={true}
            />
        </AbsoluteFill>
    );
};

export default VisualOverlay; 