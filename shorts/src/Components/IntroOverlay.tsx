import React from 'react';

import AnimatedIntro from './AnimatedIntro';

const IntroOverlay: React.FC<{
    frame: number;
    startFrame: number;
    endFrame: number;
    transition: number;
    title: string;
    image?: string;
}> = ({ frame, startFrame, endFrame, transition, title, image }) => {
    let fade = 1;
    if (frame >= endFrame) {
        fade = 1 - Math.min((frame - endFrame) / transition, 1);
    }
    return <AnimatedIntro title={title} image={image} fadeOut={fade} />;
};

export default IntroOverlay; 