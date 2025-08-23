import { useMemo } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

export interface ActiveIndicatorStyles {
}
}
}
  containerClasses: string;
  indicatorClasses: string;
  itemClasses: string;
  transitionClasses: string;

export const useActiveIndicator = (itemId: string, isActive: boolean = false): ActiveIndicatorStyles => {
  const { state } = useNavigation();
  const { 
    activeIndicators, 
    isTransitioning, 
    transitionDirection, 
    transitionDuration, 
    transitionEasing,
    pendingNavigation 
  } = state;

  const styles = useMemo(() => {
    const {
      showActiveIndicator,
      indicatorPosition,
      indicatorStyle,
      animateTransitions
    } = activeIndicators;

    // Base transition classes with dynamic duration and easing
    const transitionClasses = animateTransitions 
      ? `transition-all duration-${transitionDuration} ${transitionEasing} transform`
      : '';

    // Enhanced transition classes for smoother animations
    const smoothTransitionClasses = animateTransitions
      ? `transition-all duration-${transitionDuration} ${transitionEasing} transform will-change-transform`
      : '';

    // Container classes for positioning the indicator
    let containerClasses = 'relative';
    
    // Indicator classes based on style and position
    let indicatorClasses = '';
    
    // Item classes for active state styling
    let itemClasses = '';

    if (showActiveIndicator && isActive) {
      switch (indicatorStyle) {
        case 'line':
          switch (indicatorPosition) {
            case 'left':
              indicatorClasses = `absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full ${transitionClasses}`;
              itemClasses = 'pl-4';
              break;
            case 'right':
              indicatorClasses = `absolute right-0 top-0 bottom-0 w-1 bg-primary-500 rounded-l-full ${transitionClasses}`;
              itemClasses = 'pr-4';
              break;
            case 'top':
              indicatorClasses = `absolute top-0 left-0 right-0 h-1 bg-primary-500 rounded-b-full ${transitionClasses}`;
              itemClasses = 'pt-2';
              break;
            case 'bottom':
              indicatorClasses = `absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-full ${transitionClasses}`;
              itemClasses = 'pb-2';
              break;
          break;

        case 'dot':
          switch (indicatorPosition) {
            case 'left':
              indicatorClasses = `absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full ${transitionClasses}`;
              itemClasses = 'pl-6';
              break;
            case 'right':
              indicatorClasses = `absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full ${transitionClasses}`;
              itemClasses = 'pr-6';
              break;
            case 'top':
              indicatorClasses = `absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary-500 rounded-full ${transitionClasses}`;
              itemClasses = 'pt-4';
              break;
            case 'bottom':
              indicatorClasses = `absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary-500 rounded-full ${transitionClasses}`;
              itemClasses = 'pb-4';
              break;
          break;

        case 'background':
          indicatorClasses = `absolute inset-0 bg-primary-100 rounded-lg ${transitionClasses}`;
          itemClasses = 'relative z-10 text-primary-900';
          break;

        case 'border':
          indicatorClasses = `absolute inset-0 border-2 border-primary-500 rounded-lg ${transitionClasses}`;
          itemClasses = 'relative z-10';
          break;

    // Add enhanced transition effects if transitioning
    if (isTransitioning && animateTransitions) {
      // Different transition effects based on direction and item state
      let transitionEffect = '';
      
      if (transitionDirection === 'forward') {
        transitionEffect = isActive 
          ? 'translate-x-2 opacity-80 scale-98 blur-[0.5px]' 
          : 'translate-x-1 opacity-85 scale-99';
      } else if (transitionDirection === 'backward') {
        transitionEffect = isActive 
          ? '-translate-x-2 opacity-80 scale-98 blur-[0.5px]' 
          : '-translate-x-1 opacity-85 scale-99';
      
      containerClasses += ` ${transitionEffect}`;
      
      // Add staggered animation delay for better visual flow
      const staggerDelay = `delay-${Math.min(500, transitionDuration * 0.1)}`;
      containerClasses += ` ${staggerDelay}`;

    // Add hover effects for better interactivity
    if (!isActive) {
      itemClasses += ' hover:bg-neutral-50 hover:text-neutral-900';

    return {
      containerClasses: `${containerClasses} ${smoothTransitionClasses}`,
      indicatorClasses: `${indicatorClasses} ${smoothTransitionClasses}`,
      itemClasses: `${itemClasses} ${smoothTransitionClasses}`,
      transitionClasses: smoothTransitionClasses
    };
  }, [
    itemId,
    isActive,
    activeIndicators,
    isTransitioning,
    transitionDirection,
    transitionDuration,
    transitionEasing,
    pendingNavigation
  ]);

  return styles;
};

export default useActiveIndicator;
}
}}}}