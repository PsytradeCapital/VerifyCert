import React from 'react';
import { cn } from '../../../styles/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  paddingY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  paddingX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  fluid?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;

const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  padding,
  paddingY,
  paddingX,
  center = true,
  fluid = false,
  className = '',
  as: Component = 'div',
  ...rest
}) => {
  // Size classes with responsive breakpoints
  const sizeClasses = {
    xs: 'max-w-sm',      // 384px
    sm: 'max-w-2xl',     // 672px
    md: 'max-w-4xl',     // 896px
    lg: 'max-w-6xl',     // 1152px
    xl: 'max-w-7xl',     // 1280px
    '2xl': 'max-w-screen-2xl', // 1536px
    full: 'max-w-full'
  };

  // Enhanced responsive padding classes with better mobile-first approach
  const paddingClasses = {
    none: '',
    xs: 'px-3 xs:px-4 sm:px-5',
    sm: 'px-4 xs:px-5 sm:px-6 md:px-8',
    md: 'px-4 xs:px-6 sm:px-8 lg:px-12',
    lg: 'px-6 xs:px-8 sm:px-12 lg:px-16',
    xl: 'px-8 xs:px-12 sm:px-16 lg:px-20'
  };

  const paddingYClasses = {
    none: '',
    xs: 'py-3 xs:py-4',
    sm: 'py-4 xs:py-5 sm:py-6',
    md: 'py-6 xs:py-8 sm:py-10 lg:py-12',
    lg: 'py-8 xs:py-10 sm:py-12 lg:py-16',
    xl: 'py-10 xs:py-12 sm:py-16 lg:py-20'
  };

  const paddingXClasses = {
    none: '',
    xs: 'px-3 xs:px-4 sm:px-5',
    sm: 'px-4 xs:px-5 sm:px-6 md:px-8',
    md: 'px-4 xs:px-6 sm:px-8 lg:px-12',
    lg: 'px-6 xs:px-8 sm:px-12 lg:px-16',
    xl: 'px-8 xs:px-12 sm:px-16 lg:px-20'
  };

  // Build classes
  const baseClasses = 'w-full';
  const centerClasses = center ? 'mx-auto' : '';
  const fluidClasses = fluid ? 'max-w-full' : sizeClasses[size];
  
  // Determine padding - specific padding overrides general padding
  let finalPaddingClasses = '';
  if (paddingX || paddingY) {
    finalPaddingClasses = cn(
      paddingX ? paddingXClasses[paddingX] : '',
      paddingY ? paddingYClasses[paddingY] : ''
    );
  } else if (padding) {
    finalPaddingClasses = paddingClasses[padding];

  const combinedClasses = cn(
    baseClasses,
    centerClasses,
    fluidClasses,
    finalPaddingClasses,
    className
  );

  return (
    <Component className={combinedClasses} {...rest}>
      {children}
    </Component>
  );
};

export default Container;