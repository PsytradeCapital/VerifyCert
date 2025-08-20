import React from 'react';
/**
 * Interactive Element Animation Utilities
 * Enhanced hover and focus animations for all interactive elements
 */

import { Variants } from 'framer-motion';
import { easings, durations, springs } from '../config/motion';

// Button interaction animations
export const buttonInteractions = {
  primary: {
    whileHover: {
      scale: 1.02,
      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.25)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.98,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.01,
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  secondary: {
    whileHover: {
      scale: 1.02,
      backgroundColor: 'rgba(243, 244, 246, 1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.98,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.01,
      boxShadow: '0 0 0 3px rgba(107, 114, 128, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  tertiary: {
    whileHover: {
      scale: 1.02,
      backgroundColor: 'rgba(239, 246, 255, 1)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.98,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.01,
      backgroundColor: 'rgba(239, 246, 255, 1)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  danger: {
    whileHover: {
      scale: 1.02,
      boxShadow: '0 8px 25px rgba(220, 38, 38, 0.25)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.98,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.01,
      boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
};

// Card interaction animations
export const cardInteractions = {
  default: {
    whileHover: {
      y: -4,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
    },
    whileTap: {
      y: -2,
      scale: 0.99,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
  },
  elevated: {
    whileHover: {
      y: -6,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
    },
    whileTap: {
      y: -3,
      scale: 0.99,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
  },
  outlined: {
    whileHover: {
      y: -2,
      borderColor: 'rgba(59, 130, 246, 0.5)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
    },
    whileTap: {
      y: -1,
      scale: 0.99,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
};

// Input field interaction animations
export const inputInteractions = {
  default: {
    whileFocus: {
      scale: 1.01,
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 1)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
    },
    whileHover: {
      borderColor: 'rgba(107, 114, 128, 0.6)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  error: {
    whileFocus: {
      scale: 1.01,
      boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)',
      borderColor: 'rgba(220, 38, 38, 1)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
    },
    whileHover: {
      borderColor: 'rgba(220, 38, 38, 0.8)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  success: {
    whileFocus: {
      scale: 1.01,
      boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 1)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
    },
    whileHover: {
      borderColor: 'rgba(34, 197, 94, 0.8)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
};

// Navigation item interaction animations
export const navigationInteractions = {
  sideNavItem: {
    whileHover: {
      scale: 1.02,
      x: 4,
      backgroundColor: 'rgba(249, 250, 251, 1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.98,
      x: 2,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.01,
      x: 2,
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  bottomNavItem: {
    whileHover: {
      scale: 1.1,
      y: -2,
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.95,
      y: 0,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.05,
      y: -1,
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  breadcrumbItem: {
    whileHover: {
      scale: 1.05,
      backgroundColor: 'rgba(243, 244, 246, 1)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.98,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.02,
      backgroundColor: 'rgba(243, 244, 246, 1)',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
};

// Floating Action Button interactions
export const fabInteractions = {
  primary: {
    whileHover: {
      scale: 1.1,
      y: -4,
      boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.95,
      y: -2,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.05,
      y: -2,
      boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  secondary: {
    whileHover: {
      scale: 1.1,
      y: -4,
      boxShadow: '0 12px 30px rgba(107, 114, 128, 0.4)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.95,
      y: -2,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.05,
      y: -2,
      boxShadow: '0 0 0 4px rgba(107, 114, 128, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  accent: {
    whileHover: {
      scale: 1.1,
      y: -4,
      boxShadow: '0 12px 30px rgba(168, 85, 247, 0.4)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.95,
      y: -2,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.05,
      y: -2,
      boxShadow: '0 0 0 4px rgba(168, 85, 247, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
};

// Select dropdown interactions
export const selectInteractions = {
  trigger: {
    whileHover: {
      borderColor: 'rgba(107, 114, 128, 0.6)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileFocus: {
      scale: 1.01,
      borderColor: 'rgba(59, 130, 246, 1)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
  },
  option: {
    whileHover: {
      backgroundColor: 'rgba(239, 246, 255, 1)',
      x: 4,
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      backgroundColor: 'rgba(219, 234, 254, 1)',
      x: 2,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
};

// Modal interactions
export const modalInteractions = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: durations.normal,
      ease: easings.easeInOut
  },
  content: {
    initial: { 
      opacity: 0, 
      scale: 0.9,
      y: 20
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: 20
    },
    transition: {
      duration: durations.normal,
      ease: easings.easeOut
  },
  closeButton: {
    whileHover: {
      scale: 1.1,
      backgroundColor: 'rgba(243, 244, 246, 1)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.95,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
};

// Icon interactions
export const iconInteractions = {
  default: {
    whileHover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.95,
      rotate: -5,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
  },
  spin: {
    whileHover: {
      scale: 1.1,
      rotate: 180,
      transition: {
        duration: durations.slow,
        ease: easings.easeInOut
  },
  bounce: {
    whileHover: {
      scale: 1.2,
      y: -2,
      transition: springs.wobbly
    },
    whileTap: {
      scale: 0.9,
      y: 0,
      transition: springs.stiff
};

// Link interactions
export const linkInteractions = {
  default: {
    whileHover: {
      scale: 1.02,
      color: 'rgba(59, 130, 246, 1)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.98,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
    },
    whileFocus: {
      scale: 1.01,
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  underline: {
    whileHover: {
      scale: 1.02,
      textDecoration: 'underline',
      textDecorationColor: 'rgba(59, 130, 246, 1)',
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
};

// Badge interactions
export const badgeInteractions = {
  default: {
    whileHover: {
      scale: 1.05,
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
    },
    whileTap: {
      scale: 0.95,
      transition: {
        duration: durations.fast,
        ease: easings.easeInOut
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: easings.easeInOut
};

// Tooltip interactions
export const tooltipInteractions = {
  container: {
    whileHover: {
      scale: 1.02,
      transition: {
        duration: durations.fast,
        ease: easings.easeOut
  },
  tooltip: {
    initial: { 
      opacity: 0, 
      scale: 0.8,
      y: 10
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 10
    },
    transition: {
      duration: durations.fast,
      ease: easings.easeOut
};

// Utility function to get interaction animations based on component type and variant
export const getInteractionAnimation = (
  component: string, 
  variant: string = 'default'
): any => {
  const animations: Record<string, any> = {
    button: buttonInteractions,
    card: cardInteractions,
    input: inputInteractions,
    navigation: navigationInteractions,
    fab: fabInteractions,
    select: selectInteractions,
    modal: modalInteractions,
    icon: iconInteractions,
    link: linkInteractions,
    badge: badgeInteractions,
    tooltip: tooltipInteractions
  };

  return animations[component]?.[variant] || animations[component]?.default || {};
};

// Preset combinations for common use cases
export const interactionPresets = {
  // Subtle interactions for professional interfaces
  subtle: {
    scale: 1.01,
    transition: { duration: durations.fast, ease: easings.easeOut
  },
  
  // Pronounced interactions for call-to-action elements
  pronounced: {
    scale: 1.05,
    y: -2,
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    transition: { duration: durations.normal, ease: easings.easeOut
  },
  
  // Playful interactions for engaging elements
  playful: {
    scale: 1.1,
    rotate: 2,
    transition: springs.wobbly
  },
  
  // Minimal interactions for dense interfaces
  minimal: {
    opacity: 0.8,
    transition: { duration: durations.fast, ease: easings.easeOut
};
}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}