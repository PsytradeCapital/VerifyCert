import React from 'react';
/**
 * Validation Animation Utilities
 * Provides smooth animations for form validation feedback
 */

export interface ValidationAnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;

export const defaultAnimationConfig: ValidationAnimationConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  delay: 0
};

/**
 * CSS classes for validation animations
 */
export const validationAnimationClasses = {
  // Error animations
  errorShake: 'animate-shake',
  errorPulse: 'animate-error-pulse',
  errorSlideIn: 'animate-slide-in-error',
  
  // Success animations
  successBounce: 'animate-success-bounce',
  successFadeIn: 'animate-fade-in-success',
  successSlideIn: 'animate-slide-in-success',
  
  // Warning animations
  warningWiggle: 'animate-warning-wiggle',
  warningFadeIn: 'animate-fade-in-warning',
  
  // General animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out'
};

/**
 * Validation state animation mappings
 */
export const validationStateAnimations = {
  error: {
    field: 'animate-error-shake',
    message: 'animate-slide-in-error',
    icon: 'animate-error-pulse'
  },
  success: {
    field: 'animate-success-glow',
    message: 'animate-slide-in-success',
    icon: 'animate-success-bounce'
  },
  warning: {
    field: 'animate-warning-glow',
    message: 'animate-slide-in-warning',
    icon: 'animate-warning-wiggle'
  },
  default: {
    field: '',
    message: 'animate-fade-in',
    icon: 'animate-fade-in'
};

/**
 * Trigger validation animation on an element
 */
export const triggerValidationAnimation = (
  element: HTMLElement,
  animationType: keyof typeof validationAnimationClasses,
  config: ValidationAnimationConfig = defaultAnimationConfig
): Promise<void> => {
  return new Promise((resolve) => {
    const animationClass = validationAnimationClasses[animationType];
    
    // Remove any existing animation classes
    Object.values(validationAnimationClasses).forEach(className => {
      element.classList.remove(className);
    });
    
    // Add the new animation class
    element.classList.add(animationClass);
    
    // Set custom animation properties if provided
    if (config.duration !== defaultAnimationConfig.duration) {
      element.style.animationDuration = `${config.duration}ms`;
    if (config.easing !== defaultAnimationConfig.easing) {
      element.style.animationTimingFunction = config.easing;
    if (config.delay !== defaultAnimationConfig.delay) {
      element.style.animationDelay = `${config.delay}ms`;
    
    // Listen for animation end
    const handleAnimationEnd = () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      element.classList.remove(animationClass);
      
      // Reset custom styles
      element.style.animationDuration = '';
      element.style.animationTimingFunction = '';
      element.style.animationDelay = '';
      
      resolve();
    };
    
    element.addEventListener('animationend', handleAnimationEnd);
  });
};

/**
 * Get animation classes for validation state
 */
export const getValidationAnimationClasses = (
  validationState: 'default' | 'success' | 'error' | 'warning',
  element: 'field' | 'message' | 'icon'
): string => {
  return validationStateAnimations[validationState][element];
};

/**
 * Validation transition timing functions
 */
export const validationTransitions = {
  smooth: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-out',
  slow: 'transition-all duration-500 ease-in-out',
  bounce: 'transition-all duration-300 ease-bounce',
  elastic: 'transition-all duration-400 ease-elastic'
};

/**
 * Create staggered animation delays for multiple elements
 */
export const createStaggeredDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

/**
 * Validation feedback animation sequences
 */
export const validationSequences = {
  errorSequence: [
    { element: 'field', animation: 'errorShake', delay: 0 },
    { element: 'message', animation: 'errorSlideIn', delay: 100 },
    { element: 'icon', animation: 'errorPulse', delay: 150
  ],
  successSequence: [
    { element: 'field', animation: 'successBounce', delay: 0 },
    { element: 'icon', animation: 'successBounce', delay: 50 },
    { element: 'message', animation: 'successFadeIn', delay: 100
  ],
  warningSequence: [
    { element: 'field', animation: 'warningWiggle', delay: 0 },
    { element: 'message', animation: 'warningFadeIn', delay: 100 },
    { element: 'icon', animation: 'warningWiggle', delay: 150
  ]
};
}}}}}}}}