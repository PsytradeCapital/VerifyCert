/**
 * Framer Motion Animation Utilities
 * Common animation variants and configurations for the VerifyCert application
 */

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeInOut"
};

// Fade animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3
};

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut"
};

// Scale animations
export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: "easeOut"
};

// Slide animations
export const slideInFromLeft = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut"
};

export const slideInFromRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut"
};

// Button hover animations
export const buttonHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2
};

// Card animations
export const cardHover = {
  whileHover: { 
    y: -5, 
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" 
  },
  transition: { duration: 0.3
};

// Loading spinner animation
export const spinnerAnimation = {
  animate: { rotate: 360 },
  transition: { 
    duration: 1, 
    repeat: Infinity, 
    ease: "linear"
};

// Stagger children animation
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4
};

// Modal animations
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3
};

export const modalContent = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { duration: 0.3, ease: "easeOut"
};

// Navigation animations
export const navItemHover = {
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.95
};

// Certificate card animations
export const certificateCard = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  whileHover: { 
    scale: 1.02,
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)"
  },
  transition: { duration: 0.3
};

// Form field animations
export const formField = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3
};

// Success/Error message animations
export const messageSlide = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
  transition: { duration: 0.4, ease: "easeOut"
};
}
}}}}}}}}}}}}}}}}}