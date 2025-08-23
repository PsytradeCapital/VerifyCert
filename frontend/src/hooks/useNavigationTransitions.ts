import React from 'react';
import { useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

export interface NavigationTransitionOptions {
}
}
}
  enablePreloading?: boolean;
  enableStaggeredAnimations?: boolean;
  customDuration?: number;
  customEasing?: 'ease-in-out' | 'ease-in' | 'ease-out' | 'linear';

export interface NavigationTransitionState {
}
}
}
  isTransitioning: boolean;
  transitionDirection: 'forward' | 'backward' | 'none';
  transitionProgress: number;
  pendingNavigation: string | null;

/**
 * Hook for managing smooth navigation transitions with enhanced animations
 */
export const useNavigationTransitions = (options: NavigationTransitionOptions = {}) => {
  const {
    enablePreloading = true,
    enableStaggeredAnimations = true,
    customDuration,
    customEasing
  } = options;

  const { state, actions } = useNavigation();
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionProgressRef = useRef(0);

  // Set custom transition settings if provided
  useEffect(() => {
    if (customDuration) {
      actions.setTransitionDuration(customDuration);
    if (customEasing) {
      actions.setTransitionEasing(customEasing);
  }, [customDuration, customEasing, actions]);

  // Enhanced navigation with smooth transitions
  const navigateWithTransition = useCallback((
    path: string, 
    direction: 'forward' | 'backward' = 'forward',
    options?: { immediate?: boolean; duration?: number
  ) => {
    // Clear any existing timeouts
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);

    // Reset progress
    transitionProgressRef.current = 0;

    // Use immediate navigation if requested or animations are disabled
    if (options?.immediate || !state.activeIndicators.animateTransitions) {
      actions.navigateTo(path);
      return;

    const duration = options?.duration || state.transitionDuration;

    // Start transition
    actions.startTransition(direction, duration);

    // Track transition progress
    const progressInterval = 50; // Update every 50ms
    const progressStep = (progressInterval / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      transitionProgressRef.current = Math.min(100, transitionProgressRef.current + progressStep);
      
      if (transitionProgressRef.current >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
    }, progressInterval);

    // Navigate to the new path
    actions.navigateTo(path);

  }, [state.activeIndicators.animateTransitions, state.transitionDuration, actions]);

  // Preload navigation target (if enabled)
  const preloadNavigation = useCallback((path: string) => {
    if (!enablePreloading) return;

    // Create a link element to trigger browser preloading
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);

    // Clean up after a short delay
    setTimeout(() => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
    }, 5000);
  }, [enablePreloading]);

  // Staggered animation for multiple navigation items
  const getStaggerDelay = useCallback((index: number, totalItems: number = 1) => {
    if (!enableStaggeredAnimations || !state.isTransitioning) return 0;
    
    const maxDelay = state.transitionDuration * 0.3; // Max 30% of transition duration
    const delayStep = maxDelay / Math.max(1, totalItems - 1);
    
    return Math.min(maxDelay, index * delayStep);
  }, [enableStaggeredAnimations, state.isTransitioning, state.transitionDuration]);

  // Get transition classes for elements
  const getTransitionClasses = useCallback((
    baseClasses: string = '',
    staggerIndex?: number,
    totalItems?: number
  ) => {
    const { transitionDuration, transitionEasing, isTransitioning, transitionDirection } = state;
    
    let classes = baseClasses;
    
    // Add base transition classes
    if (state.activeIndicators.animateTransitions) {
      classes += ` transition-all duration-${transitionDuration} ${transitionEasing} transform will-change-transform`;

    // Add stagger delay if provided
    if (staggerIndex !== undefined && totalItems !== undefined) {
      const delay = getStaggerDelay(staggerIndex, totalItems);
      if (delay > 0) {
        classes += ` delay-${Math.round(delay)}`;

    // Add transition state classes
    if (isTransitioning) {
      const intensity = transitionDirection === 'forward' ? 1 : -1;
      classes += ` translate-x-${intensity} opacity-90 scale-98`;

    return classes.trim();
  }, [state, getStaggerDelay]);

  // Get current transition state
  const getTransitionState = useCallback((): NavigationTransitionState => ({
    isTransitioning: state.isTransitioning,
    transitionDirection: state.transitionDirection,
    transitionProgress: transitionProgressRef.current,
    pendingNavigation: state.pendingNavigation
  }), [state.isTransitioning, state.transitionDirection, state.pendingNavigation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
    };
  }, []);

  return {
    // Navigation methods
    navigateWithTransition,
    preloadNavigation,
    
    // Utility methods
    getStaggerDelay,
    getTransitionClasses,
    getTransitionState,
    
    // State
    transitionState: getTransitionState(),
    
    // Configuration
    isAnimationEnabled: state.activeIndicators.animateTransitions,
    transitionDuration: state.transitionDuration,
    transitionEasing: state.transitionEasing
  };
};

export default useNavigationTransitions;
}
}}}}}}}}}}