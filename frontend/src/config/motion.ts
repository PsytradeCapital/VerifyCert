/**
 * Framer Motion Configuration
 * Global settings and configurations for animations
 */

// Global animation settings
export const motionConfig = {
  // Reduce motion for users who prefer reduced motion
  respectReducedMotion: true,
  
  // Default transition settings
  defaultTransition: {
    duration: 0.3,
    ease: "easeInOut"
  },
  
  // Animation performance settings
  layoutTransition: {
    duration: 0.3,
    ease: "easeInOut"
  }
};

// Easing functions
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  bounce: [0.68, -0.55, 0.265, 1.55]
};

// Duration presets
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8
};

// Common spring configurations
export const springs = {
  gentle: {
    type: "spring",
    stiffness: 120,
    damping: 14
  },
  wobbly: {
    type: "spring",
    stiffness: 180,
    damping: 12
  },
  stiff: {
    type: "spring",
    stiffness: 210,
    damping: 20
  }
};

// Viewport settings for scroll-triggered animations
export const viewport = {
  once: true,
  margin: "0px 0px -100px 0px"
};