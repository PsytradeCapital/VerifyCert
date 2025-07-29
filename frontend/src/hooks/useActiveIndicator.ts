import { useMemo } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

export interface ActiveIndicatorStyles {
  containerClasses: string;
  indicatorClasses: string;
  itemClasses: string;
  transitionClasses: string;
}

export const useActiveIndicator = (itemId: string, isActive: boolean = false): ActiveIndicatorStyles => {
  const { state } = useNavigation();
  const { activeIndicators, isTransitioning, transitionDirection } = state;

  const styles = useMemo(() => {
    const {
      showActiveIndicator,
      indicatorPosition,
      indicatorStyle,
      animateTransitions
    } = activeIndicators;

    // Base transition classes
    const transitionClasses = animateTransitions 
      ? 'transition-all duration-300 ease-in-out transform'
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
          }
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
          }
          break;

        case 'background':
          indicatorClasses = `absolute inset-0 bg-primary-100 rounded-lg ${transitionClasses}`;
          itemClasses = 'relative z-10 text-primary-900';
          break;

        case 'border':
          indicatorClasses = `absolute inset-0 border-2 border-primary-500 rounded-lg ${transitionClasses}`;
          itemClasses = 'relative z-10';
          break;
      }
    }

    // Add transition effects if transitioning
    if (isTransitioning && animateTransitions) {
      const transitionEffect = transitionDirection === 'forward' 
        ? 'translate-x-1 opacity-90' 
        : '-translate-x-1 opacity-90';
      
      containerClasses += ` ${transitionEffect}`;
    }

    return {
      containerClasses: `${containerClasses} ${transitionClasses}`,
      indicatorClasses,
      itemClasses,
      transitionClasses
    };
  }, [
    itemId,
    isActive,
    activeIndicators,
    isTransitioning,
    transitionDirection
  ]);

  return styles;
};

export default useActiveIndicator;