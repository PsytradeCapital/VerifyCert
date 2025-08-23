export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

export const createHoverAnimation = (config: AnimationConfig = {}) => {
  const { duration = 200, easing = 'ease-in-out' } = config;
  return {
    transition: `all ${duration}ms ${easing}`,
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  };
};

export const createClickAnimation = (config: AnimationConfig = {}) => {
  const { duration = 150, easing = 'ease-out' } = config;
  return {
    transition: `transform ${duration}ms ${easing}`,
    transform: 'scale(0.98)'
  };
};

export const fadeIn = (config: AnimationConfig = {}) => {
  const { duration = 300, delay = 0 } = config;
  return {
    opacity: 0,
    animation: `fadeIn ${duration}ms ease-in-out ${delay}ms forwards`
  };
};

export const slideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'up', config: AnimationConfig = {}) => {
  const { duration = 400, delay = 0 } = config;
  const transforms = {
    left: 'translateX(-20px)',
    right: 'translateX(20px)',
    up: 'translateY(20px)',
    down: 'translateY(-20px)'
  };
  
  const directionCapitalized = direction.charAt(0).toUpperCase() + direction.slice(1);
  
  return {
    opacity: 0,
    transform: transforms[direction],
    animation: `slideIn${directionCapitalized} ${duration}ms ease-out ${delay}ms forwards`
  };
};
