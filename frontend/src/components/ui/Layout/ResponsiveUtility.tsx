import React from 'react';
import { cn } from '../../../styles/utils';

export interface ResponsiveUtilityProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile-only component - only renders on mobile devices
 */
export const MobileOnly: React.FC<ResponsiveUtilityProps> = ({ children, className }) => (
  <div className={cn('mobile-only', className)}>
    {children}
  </div>
);

/**
 * Tablet-only component - only renders on tablet devices
 */
export const TabletOnly: React.FC<ResponsiveUtilityProps> = ({ children, className }) => (
  <div className={cn('tablet-only', className)}>
    {children}
  </div>
);

/**
 * Desktop-only component - only renders on desktop devices
 */
export const DesktopOnly: React.FC<ResponsiveUtilityProps> = ({ children, className }) => (
  <div className={cn('desktop-only', className)}>
    {children}
  </div>
);

/**
 * Touch-only component - only renders on touch devices
 */
export const TouchOnly: React.FC<ResponsiveUtilityProps> = ({ children, className }) => (
  <div className={cn('touch-only', className)}>
    {children}
  </div>
);

/**
 * Hover-only component - only renders on devices that support hover
 */
export const HoverOnly: React.FC<ResponsiveUtilityProps> = ({ children, className }) => (
  <div className={cn('hover-only', className)}>
    {children}
  </div>
);

export interface ResponsiveShowProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  className?: string;
}

/**
 * Responsive show component - renders different content based on screen size
 */
export const ResponsiveShow: React.FC<ResponsiveShowProps> = ({
  mobile,
  tablet,
  desktop,
  className
}) => (
  <div className={className}>
    {mobile && <MobileOnly>{mobile}</MobileOnly>}
    {tablet && <TabletOnly>{tablet}</TabletOnly>}
    {desktop && <DesktopOnly>{desktop}</DesktopOnly>}
  </div>
);

export interface SafeAreaProps {
  children: React.ReactNode;
  sides?: 'all' | 'x' | 'y' | 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * Safe area component - adds safe area padding for mobile devices
 */
export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  sides = 'all',
  className
}) => {
  const safeAreaClasses = {
    all: 'safe-area',
    x: 'safe-area-x',
    y: 'safe-area-y',
    top: 'safe-top',
    bottom: 'safe-bottom',
    left: 'safe-left',
    right: 'safe-right'
  };

  return (
    <div className={cn(safeAreaClasses[sides], className)}>
      {children}
    </div>
  );
};

export interface TouchTargetProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  as?: 'button' | 'div' | 'a';
  href?: string;
}

/**
 * Touch target component - ensures minimum touch target size for accessibility
 */
export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  size = 'md',
  as: Component = 'button',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'touch-target-sm',
    md: 'touch-target',
    lg: 'touch-target-lg',
    xl: 'touch-target-xl'
  };

  const combinedClassName = cn(sizeClasses[size], className);

  if (Component === 'a') {
    return (
      <a className={combinedClassName} {...(props as any)}>
        {children}
      </a>
    );
  }

  if (Component === 'div') {
    return (
      <div className={combinedClassName} {...(props as any)}>
        {children}
      </div>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

export interface MobilePaddingProps {
  children: React.ReactNode;
  direction?: 'all' | 'x' | 'y';
  className?: string;
}

/**
 * Mobile padding component - applies responsive padding optimized for mobile
 */
export const MobilePadding: React.FC<MobilePaddingProps> = ({
  children,
  direction = 'all',
  className
}) => {
  const paddingClasses = {
    all: 'mobile-padding',
    x: 'mobile-padding-x',
    y: 'mobile-padding-y'
  };

  return (
    <div className={cn(paddingClasses[direction], className)}>
      {children}
    </div>
  );
};

export interface ResponsiveGridProps {
  children: React.ReactNode;
  mobileCols?: number;
  tabletCols?: number;
  desktopCols?: number;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

/**
 * Responsive grid component - automatically adjusts columns based on screen size
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  mobileCols = 1,
  tabletCols,
  desktopCols = 3,
  gap = 'md',
  className
}) => {
  const getColsClass = (cols: number, prefix = '') => {
    const prefixStr = prefix ? `${prefix}:` : '';
    return `${prefixStr}grid-cols-${cols}`;
  };

  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1 xs:gap-1.5',
    sm: 'gap-2 xs:gap-3',
    md: 'gap-3 xs:gap-4 sm:gap-5',
    lg: 'gap-4 xs:gap-5 sm:gap-6 lg:gap-8',
    xl: 'gap-6 xs:gap-7 sm:gap-8 lg:gap-10',
    '2xl': 'gap-8 xs:gap-10 sm:gap-12 lg:gap-16'
  };

  const gridClasses = cn(
    'grid',
    getColsClass(mobileCols),
    tabletCols && getColsClass(tabletCols, 'md'),
    getColsClass(desktopCols, 'lg'),
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export interface ResponsiveTextProps {
  children: React.ReactNode;
  mobileSize?: string;
  tabletSize?: string;
  desktopSize?: string;
  className?: string;
}

/**
 * Responsive text component - adjusts text size based on screen size
 */
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  mobileSize = 'base',
  tabletSize,
  desktopSize = 'lg',
  className
}) => {
  const textClasses = cn(
    `text-${mobileSize}`,
    tabletSize && `md:text-${tabletSize}`,
    `lg:text-${desktopSize}`,
    className
  );

  return (
    <span className={textClasses}>
      {children}
    </span>
  );
};