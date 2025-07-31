/**
 * Hook for managing interaction animations
 * Provides consistent animation behavior across components
 */

import { useReducedMotion } from 'framer-motion';
import { getInteractionAnimation, interactionPresets } from '../utils/interactionAnimations';

export interface UseInteractionAnimationsOptions {
  component: string;
  variant?: string;
  disabled?: boolean;
  preset?: 'subtle' | 'pronounced' | 'playful' | 'minimal';
  customAnimations?: any;
  respectReducedMotion?: boolean;
}

export const useInteractionAnimations = ({
  component,
  variant = 'default',
  disabled = false,
  preset,
  customAnimations,
  respectReducedMotion = true
}: UseInteractionAnimationsOptions) => {
  const shouldReduceMotion = useReducedMotion();
  
  // If user prefers reduced motion and we should respect it, return empty animations
  if (respectReducedMotion && shouldReduceMotion) {
    return {};
  }
  
  // If component is disabled, return empty animations
  if (disabled) {
    return {};
  }
  
  // Use custom animations if provided
  if (customAnimations) {
    return customAnimations;
  }
  
  // Use preset if specified
  if (preset) {
    return {
      whileHover: interactionPresets[preset],
      whileTap: { 
        scale: 0.98,
        transition: { duration: 0.1 }
      }
    };
  }
  
  // Get component-specific animations
  return getInteractionAnimation(component, variant);
};

// Specialized hooks for common components
export const useButtonAnimations = (variant: string = 'primary', disabled: boolean = false) => {
  return useInteractionAnimations({
    component: 'button',
    variant,
    disabled
  });
};

export const useCardAnimations = (variant: string = 'default', disabled: boolean = false) => {
  return useInteractionAnimations({
    component: 'card',
    variant,
    disabled
  });
};

export const useNavigationAnimations = (variant: string = 'sideNavItem', disabled: boolean = false) => {
  return useInteractionAnimations({
    component: 'navigation',
    variant,
    disabled
  });
};

export const useInputAnimations = (variant: string = 'default', disabled: boolean = false) => {
  return useInteractionAnimations({
    component: 'input',
    variant,
    disabled
  });
};

export const useFabAnimations = (variant: string = 'primary', disabled: boolean = false) => {
  return useInteractionAnimations({
    component: 'fab',
    variant,
    disabled
  });
};

export const useIconAnimations = (variant: string = 'default', disabled: boolean = false) => {
  return useInteractionAnimations({
    component: 'icon',
    variant,
    disabled
  });
};

export const useLinkAnimations = (variant: string = 'default', disabled: boolean = false) => {
  return useInteractionAnimations({
    component: 'link',
    variant,
    disabled
  });
};

// Hook for creating staggered animations for lists
export const useStaggeredAnimations = (itemCount: number, delay: number = 0.1) => {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return {
      container: {},
      item: {}
    };
  }
  
  return {
    container: {
      animate: {
        transition: {
          staggerChildren: delay
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    }
  };
};

// Hook for focus management with animations
export const useFocusAnimations = () => {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return {
      focusProps: {},
      focusRingClass: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    };
  }
  
  return {
    focusProps: {
      whileFocus: {
        scale: 1.02,
        transition: { duration: 0.2 }
      }
    },
    focusRingClass: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
  };
};

// Hook for hover state management
export const useHoverState = () => {
  const shouldReduceMotion = useReducedMotion();
  
  return {
    shouldAnimate: !shouldReduceMotion,
    hoverClass: shouldReduceMotion ? 'hover:opacity-80' : ''
  };
};

export default useInteractionAnimations;