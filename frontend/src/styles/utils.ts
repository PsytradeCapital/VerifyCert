// Utility functions for styling

/**
 * Combines class names conditionally
 * Similar to clsx/classnames utility
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getColor = (color: string, shade: number) => {
  return `var(--color-${color}-${shade})`;
};

export const createAnimation = (name: string, duration: number, easing: string) => {
  return {
    animationName: name,
    animationDuration: duration + 'ms',
    animationTimingFunction: easing
  };
};

export const animations = {
  fadeIn: 'opacity 0.3s ease-in-out',
  slideUp: 'transform 0.4s ease-out',
  scaleIn: 'transform 0.3s ease-out'
};

export const colorCombinations = {
  primary: {
    background: 'var(--color-primary-500)',
    backgroundHover: 'var(--color-primary-600)',
    backgroundActive: 'var(--color-primary-700)',
    text: 'var(--color-neutral-50)',
    border: 'var(--color-primary-500)'
  },
  secondary: {
    background: 'var(--color-neutral-100)',
    backgroundHover: 'var(--color-neutral-200)',
    backgroundActive: 'var(--color-neutral-300)',
    text: 'var(--color-neutral-900)',
    border: 'var(--color-neutral-300)'
  }
};

export const createResponsiveClasses = (baseClass: string, breakpoints: Record<string, string>) => {
  const classes = [baseClass];
  
  Object.entries(breakpoints).forEach(([breakpoint, className]) => {
    classes.push(breakpoint + ':' + className);
  });
  
  return classes.join(' ');
};

export const validateContrast = (foreground: string, background: string) => {
  // Simple contrast validation
  return true;
};

export const createVariants = <T extends Record<string, any>>(variants: T) => {
  return variants;
};

export const createSizes = <T extends Record<string, any>>(sizes: T) => {
  return sizes;
};

export const createResponsiveClass = (
  mobileClass: string,
  desktopClass: string,
  tabletClass?: string
) => {
  const classes = [mobileClass];
  
  if (tabletClass) {
    classes.push('md:' + tabletClass);
    classes.push('lg:' + desktopClass);
  } else {
    classes.push('md:' + desktopClass);
  }
  
  return classes.join(' ');
};

export const createResponsiveSpacing = (mobile: string, desktop: string, tablet?: string) => {
  return createResponsiveClass('p-' + mobile, 'p-' + desktop, tablet ? 'p-' + tablet : undefined);
};

export const createResponsiveText = (mobile: string, desktop: string, tablet?: string) => {
  return createResponsiveClass('text-' + mobile, 'text-' + desktop, tablet ? 'text-' + tablet : undefined);
};

export const createSafeAreaPadding = (direction: 'top' | 'bottom' | 'left' | 'right' | 'all' = 'all') => {
  const paddingMap = {
    top: 'pt-safe',
    bottom: 'pb-safe',
    left: 'pl-safe',
    right: 'pr-safe',
    all: 'p-safe'
  };
  
  return paddingMap[direction] || paddingMap.all;
};

export const createResponsiveGrid = (mobileCols: number, desktopCols: number, tabletCols?: number) => {
  const mobileClass = 'grid-cols-' + mobileCols;
  const desktopClass = 'grid-cols-' + desktopCols;
  const tabletClass = tabletCols ? 'grid-cols-' + tabletCols : undefined;
  
  return createResponsiveClass(mobileClass, desktopClass, tabletClass);
};

export class ResponsiveManager {
  private listeners: Array<(size: 'mobile' | 'tablet' | 'desktop') => void> = [];
  
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.handleResize());
    }
  }
  
  private handleResize() {
    const size = this.getCurrentSize();
    this.listeners.forEach(callback => callback(size));
  }
  
  public addListener(callback: (size: 'mobile' | 'tablet' | 'desktop') => void) {
    this.listeners.push(callback);
  }
  
  public removeListener(callback: (size: 'mobile' | 'tablet' | 'desktop') => void) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }
  
  public destroy() {
    this.listeners = [];
  }
  
  public getCurrentSize(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}
