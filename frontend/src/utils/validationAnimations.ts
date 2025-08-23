import React from 'react';
// Validation animation utilities
export interface ValidationAnimationConfig {
  duration: number;
  easing: string;
  delay: number;

export const defaultAnimationConfig: ValidationAnimationConfig = {
  duration: 300,
  easing: 'ease-in-out',
  delay: 0
};

export const validationAnimationClasses = {
  errorShake: 'animate-shake',
  successPulse: 'animate-pulse',
  warningBounce: 'animate-bounce',
  errorSlideIn: 'animate-slide-in',
  successFadeIn: 'animate-fade-in'
};

export const triggerValidationAnimation = (
  element: HTMLElement,
  animationType: keyof typeof validationAnimationClasses,
  config: ValidationAnimationConfig = defaultAnimationConfig
): Promise<void> => {
  return new Promise((resolve) => {
    const animationClass = validationAnimationClasses[animationType];
    
    element.classList.add(animationClass);

    if (config.duration !== defaultAnimationConfig.duration) {
      element.style.animationDuration = `${config.duration}ms`;
    if (config.easing !== defaultAnimationConfig.easing) {
      element.style.animationTimingFunction = config.easing;
    if (config.delay !== defaultAnimationConfig.delay) {
      element.style.animationDelay = `${config.delay}ms`;

    const handleAnimationEnd = () => {
      element.classList.remove(animationClass);
      element.style.animationDuration = '';
      element.style.animationTimingFunction = '';
      element.style.animationDelay = '';
      element.removeEventListener('animationend', handleAnimationEnd);
      resolve();
    };

    element.addEventListener('animationend', handleAnimationEnd);
  });
};

export const getValidationAnimationClasses = (
  validationState: 'default' | 'success' | 'error' | 'warning',
  element: 'field' | 'message' | 'icon'
): string => {
  const baseClasses = 'transition-all duration-300';
  const stateClasses = {
    default: '',
    success: 'border-green-500 text-green-600',
    error: 'border-red-500 text-red-600',
    warning: 'border-yellow-500 text-yellow-600'
  };
  
  return `${baseClasses} ${stateClasses[validationState]}`;
};

export const validationTransitions = {
  smooth: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-out',
  slow: 'transition-all duration-500 ease-in-out',
  bounce: 'transition-all duration-300 ease-bounce'
};

export const createStaggeredDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

export const validationSequences = {
  errorSequence: [
    { element: 'field', animation: 'errorShake', delay: 0 },
    { element: 'message', animation: 'errorSlideIn', delay: 100
  ],
  successSequence: [
    { element: 'field', animation: 'successPulse', delay: 0 },
    { element: 'message', animation: 'successFadeIn', delay: 150
  ]
};
