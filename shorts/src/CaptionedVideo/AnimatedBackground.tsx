import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

const NUM_PARTICLES = 10;
const PARTICLE_COLORS = ['#FFFACD', '#FFD700', '#FFFFFF', '#FFF8DC', '#FFEC8B']; // bright gold/white
const BG_GRADIENT = 'linear-gradient(135deg, #3a8dde 0%, #7b2ff2 100%)'; // vibrant blue to purple

// Helper for random but deterministic positions
function seededRandom(seed: number) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export const Particles: React.FC<{ frame: number; width: number; height: number }> = ({ frame, width, height }) => {
    const particles = useMemo(() => {
        // Margin so sparkles don't hug the edges
        const marginX = width * 0.08;
        const marginY = height * 0.08;
        return Array.from({ length: NUM_PARTICLES }).map((_, i) => {
            const baseX = marginX + seededRandom(i * 2 + 1) * (width - 2 * marginX);
            const baseY = marginY + seededRandom(i * 2 + 2) * (height - 2 * marginY);
            const size = 12 + seededRandom(i + 200) * 16;
            const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
            const speed = 0.5 + seededRandom(i + 300) * 1.5;
            return { baseX, baseY, size, color, speed, seed: i };
        });
    }, [width, height]);

    return (
        <>
            {particles.map((p, i) => {
                // Animate y position and opacity for twinkle
                const y = p.baseY + Math.sin((frame + i * 10) * 0.03 * p.speed) * 18;
                const opacity = 0.8 + 0.2 * Math.sin((frame + i * 20) * 0.07 * p.speed);
                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: p.baseX,
                            top: y,
                            width: p.size,
                            height: p.size,
                            borderRadius: '50%',
                            background: p.color,
                            opacity,
                            filter: 'blur(1.5px) drop-shadow(0 0 16px #fff9b0) drop-shadow(0 0 8px #fff)',
                            pointerEvents: 'none',
                        }}
                    />
                );
            })}
        </>
    );
};

const AnimatedBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    return (
        <AbsoluteFill
            style={{
                zIndex: 0,
                width: '100%',
                height: '100%',
                background: BG_GRADIENT,
                overflow: 'hidden',
                position: 'absolute',
            }}
        >
            <Particles frame={frame} width={width} height={height} />
        </AbsoluteFill>
    );
};

export default AnimatedBackground; 