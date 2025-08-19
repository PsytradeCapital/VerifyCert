import React from 'react';
import { cn } from '../../../styles/utils';

export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'centered' | 'wide' | 'narrow';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: keyof JSX.IntrinsicElements;

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  as: Component = 'div',
}) => {
  const variantClasses = {
    default: 'container-responsive',
    centered: 'container-responsive mx-auto text-center',
    wide: 'w-full max-w-screen-2xl mx-auto px-responsive',
    narrow: 'w-full max-w-2xl mx-auto px-responsive'
  };

  const paddingClasses = {
    none: '',
    sm: 'py-4 sm:py-6 lg:py-8',
    md: 'py-6 sm:py-8 lg:py-12',
    lg: 'py-8 sm:py-12 lg:py-16',
    xl: 'py-12 sm:py-16 lg:py-24'
  };

  const combinedClasses = cn(
    'layout-responsive',
    variantClasses[variant],
    paddingClasses[padding],
    className
  );

  return (
    <Component className={combinedClasses}>
      {children}
    </Component>
  );
};

export default ResponsiveLayout;