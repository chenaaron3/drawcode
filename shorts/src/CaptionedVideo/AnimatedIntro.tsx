import React, { useEffect, useMemo, useRef } from 'react';
import {
    AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig
} from 'remotion';

import AnimatedBackground from './AnimatedBackground';

export const AnimatedIntro: React.FC<{ title: string; image: string; fadeOut?: number }> = ({ title, image, fadeOut = 1 }) => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();

    // Typewriter effect: reveal letters over 1.2s
    const charsToShow = Math.min(
        title.length,
        Math.floor((frame / (fps * 1.2)) * title.length)
    );
    const shownTitle = title.slice(0, charsToShow);
    // Fade in as typewriter progresses
    const fade = interpolate(charsToShow, [0, title.length * 0.5, title.length], [0, 0.7, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Calculate when the typewriter effect ends (in frames)
    const typewriterDurationFrames = Math.ceil(fps * 1.2);

    // Image idle animation: gentle up-down float
    const floatY = Math.sin(frame * 0.04) * 18;
    const floatScale = 1 + Math.sin(frame * 0.03) * 0.015;

    return (
        <AbsoluteFill
            style={{
                zIndex: 1000,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: fadeOut,
                transition: 'opacity 0.3s',
            }}
        >
            {/* Shared animated background */}
            <AnimatedBackground />
            {/* Play audio only while typewriter is active */}
            {frame < typewriterDurationFrames && (
                <Audio src={staticFile('keyboard.mp3')} />
            )}
            {/* Title at the top center */}
            <div
                style={{
                    position: 'absolute',
                    width: '60%',
                    left: '50%',
                    top: '20%', // near the top
                    transform: 'translate(-50%, 0)',
                    zIndex: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        background: 'rgba(30, 34, 60, 0.55)',
                        boxShadow: '0 4px 32px #0006',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 24,
                        padding: '32px 48px',
                        minWidth: 320,
                        color: '#fff',
                        fontSize: 90,
                        fontWeight: 700,
                        textAlign: 'center',
                        textShadow: '0 4px 32px #0008, 0 2px 8px #7b2ff2',
                        fontFamily: 'sans-serif',
                        letterSpacing: 1.5,
                        minHeight: 90,
                        opacity: fade,
                        transition: 'opacity 0.3s',
                        userSelect: 'none',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                    }}
                >
                    {shownTitle}
                    <span style={{ opacity: charsToShow < title.length ? 0.5 : 0, transition: 'opacity 0.2s' }}>|</span>
                </div>
            </div>
            {/* Image at the bottom center */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '20%', // near the bottom
                    transform: `translate(-50%, 0) translateY(${floatY}px) scale(${floatScale})`,
                    zIndex: 2,
                    pointerEvents: 'none',
                }}
            >
                <img
                    src={staticFile(image)}
                    alt="Intro"
                    style={{
                        width: width * 0.4,
                        height: 'auto',
                        borderRadius: 32,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        display: 'block',
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};

export default AnimatedIntro; 