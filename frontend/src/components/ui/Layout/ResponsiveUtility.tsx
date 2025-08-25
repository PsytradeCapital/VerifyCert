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