// Unified animation system for all visualizers
const ANIMATION_DURATION = 0.3;

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: {
    duration: ANIMATION_DURATION,
    ease: [0.4, 0.0, 0.2, 1], // Custom easing for smooth feel
  },
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: {
    duration: ANIMATION_DURATION,
    ease: [0.4, 0.0, 0.2, 1],
  },
};

// Legacy export for compatibility
export const valueVariants = fadeInUp;
