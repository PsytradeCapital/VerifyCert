export interface ValidationAnimationConfig {
  duration: number;
  easing: string;
}

export const defaultAnimationConfig: ValidationAnimationConfig = {
  duration: 300,
  easing: 'ease-in-out'
};

export const validationAnimationClasses = {
  success: 'animate-pulse text-green-600',
  error: 'animate-shake text-red-600',
  warning: 'animate-bounce text-yellow-600',
  default: 'text-gray-600'
};

export const animateValidation = (
  element: HTMLElement,
  animationType: keyof typeof validationAnimationClasses
): Promise<void> => {
  return new Promise((resolve) => {
    const className = validationAnimationClasses[animationType];
    element.className = className;
    
    setTimeout(() => {
      resolve();
    }, defaultAnimationConfig.duration);
  });
};
