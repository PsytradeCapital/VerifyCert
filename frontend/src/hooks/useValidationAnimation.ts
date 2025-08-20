import React from 'react';
/**
 * useValidationAnimation Hook
 * Manages smooth animations for form validation feedback
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { 
  triggerValidationAnimation, 
  getValidationAnimationClasses,
  validationSequences,
  ValidationAnimationConfig;
} from '../utils/validationAnimations';

export interface UseValidationAnimationOptions {
  animateOnChange?: boolean;
  animationConfig?: ValidationAnimationConfig;
  enableSequence?: boolean;
  debounceMs?: number;

export interface ValidationAnimationRefs {
  fieldRef: React.RefObject<HTMLElement>;
  messageRef: React.RefObject<HTMLElement>;
  iconRef: React.RefObject<HTMLElement>;

export interface ValidationAnimationControls {
  triggerFieldAnimation: (animationType: string) => Promise<void>;
  triggerMessageAnimation: (animationType: string) => Promise<void>;
  triggerIconAnimation: (animationType: string) => Promise<void>;
  triggerSequence: (validationState: 'error' | 'success' | 'warning') => Promise<void>;
  getAnimationClasses: (element: 'field' | 'message' | 'icon') => string;
  isAnimating: boolean;

export const useValidationAnimation = (
  validationState: 'default' | 'success' | 'error' | 'warning',
  options: UseValidationAnimationOptions = {}
): ValidationAnimationRefs & ValidationAnimationControls => {
  const {
    animateOnChange = true,
    animationConfig,
    enableSequence = true,
    debounceMs = 100
  } = options;

  // Refs for animation targets
  const fieldRef = useRef<HTMLElement>(null);
  const messageRef = useRef<HTMLElement>(null);
  const iconRef = useRef<HTMLElement>(null);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousState, setPreviousState] = useState(validationState);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Animation control functions
  const triggerFieldAnimation = useCallback(async (animationType: string) => {
    if (!fieldRef.current) return;
    setIsAnimating(true);
    try {
      await triggerValidationAnimation(
        fieldRef.current,
        animationType as any,
        animationConfig
      );
    } finally {
      setIsAnimating(false);
  }, [animationConfig]);

  const triggerMessageAnimation = useCallback(async (animationType: string) => {
    if (!messageRef.current) return;
    setIsAnimating(true);
    try {
      await triggerValidationAnimation(
        messageRef.current,
        animationType as any,
        animationConfig
      );
    } finally {
      setIsAnimating(false);
  }, [animationConfig]);

  const triggerIconAnimation = useCallback(async (animationType: string) => {
    if (!iconRef.current) return;
    setIsAnimating(true);
    try {
      await triggerValidationAnimation(
        iconRef.current,
        animationType as any,
        animationConfig
      );
    } finally {
      setIsAnimating(false);
  }, [animationConfig]);

  // Trigger animation sequence for validation state
  const triggerSequence = useCallback(async (state: 'error' | 'success' | 'warning') => {
    if (!enableSequence) return;
    
    const sequence = validationSequences[`${state}Sequence` as keyof typeof validationSequences];
    if (!sequence) return;

    setIsAnimating(true);
    
    try {
      // Execute animations in sequence with delays
      const animationPromises = sequence.map(({ element, animation, delay }) => {
        return new Promise<void>((resolve) => {
          setTimeout(async () => {
            const ref = element === 'field' ? fieldRef : 
                      element === 'message' ? messageRef : iconRef;
            
            if (ref.current) {
              await triggerValidationAnimation(
                ref.current,
                animation as any,
                animationConfig
              );
            resolve();
          }, delay);
        });
      });

      await Promise.all(animationPromises);
    } finally {
      setIsAnimating(false);
  }, [enableSequence, animationConfig]);

  // Get animation classes for current validation state
  const getAnimationClasses = useCallback((element: 'field' | 'message' | 'icon') => {
    return getValidationAnimationClasses(validationState, element);
  }, [validationState]);

  // Auto-trigger animations on validation state change
  useEffect(() => {
    if (!animateOnChange || validationState === previousState) return;

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);

    // Debounce animation triggers to prevent excessive animations
    debounceTimeoutRef.current = setTimeout(() => {
      if (validationState !== 'default' && validationState !== previousState) {
        triggerSequence(validationState as 'error' | 'success' | 'warning');
      setPreviousState(validationState);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    };
  }, [validationState, previousState, animateOnChange, debounceMs, triggerSequence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  return {
    // Refs
    fieldRef,
    messageRef,
    iconRef,
    
    // Controls
    triggerFieldAnimation,
    triggerMessageAnimation,
    triggerIconAnimation,
    triggerSequence,
    getAnimationClasses,
    isAnimating
  };
};

/**
 * Hook for managing validation message animations specifically
 */
export const useValidationMessageAnimation = (
  message: string | undefined,
  validationState: 'default' | 'success' | 'error' | 'warning'
) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [isVisible, setIsVisible] = useState(!!message);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);

    if (message) {
      // Show new message immediately
      setDisplayMessage(message);
      setIsVisible(true);
    } else {
      // Hide message with delay for exit animation
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        setDisplayMessage(undefined);
      }, 300); // Match animation duration

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    };
  }, [message]);

  return {
    displayMessage,
    isVisible,
    animationClass: isVisible ? 'animate-slide-up' : 'animate-fade-out'
  };
};

/**
 * Hook for managing validation icon animations
 */
export const useValidationIconAnimation = (
  validationState: 'default' | 'success' | 'error' | 'warning',
  showIcon: boolean = true
) => {
  const [currentState, setCurrentState] = useState(validationState);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (validationState !== currentState && showIcon) {
      setIsChanging(true);
      
      // Delay state change to allow exit animation
      const timeout = setTimeout(() => {
        setCurrentState(validationState);
        setIsChanging(false);
      }, 150);

      return () => clearTimeout(timeout);
    } else {
      setCurrentState(validationState);
  }, [validationState, currentState, showIcon]);

  const getIconAnimationClass = () => {
    if (!showIcon || currentState === 'default') return '';
    
    if (isChanging) {
      return 'animate-scale-out';
    
    return 'animate-icon-pop-in';
  };

  return {
    currentState,
    isChanging,
    animationClass: getIconAnimationClass(),
    shouldShowIcon: showIcon && currentState !== 'default'
  };
};
}}}}}}}}}}}}}}}}}