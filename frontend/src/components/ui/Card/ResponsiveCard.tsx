import React from 'react';
import { cn } from '../../../styles/utils';

export interface ResponsiveCardProps {
}
}
}
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
  as?: keyof JSX.IntrinsicElements;

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  interactive = false,
  as: Component = 'div',
}) => {
  const variantClasses = {
    default: 'card-responsive',
    elevated: 'card-responsive shadow-lg',
    outlined: 'bg-white border-2 border-neutral-200 rounded-lg p-responsive transition-all duration-200',
    ghost: 'bg-transparent border-none shadow-none p-responsive'
  };

  const paddingClasses = {
    none: variant === 'default' || variant === 'elevated' ? 'p-0' : '',
    sm: variant === 'default' || variant === 'elevated' ? 'p-3 sm:p-4' : 'p-3 sm:p-4',
    md: variant === 'default' || variant === 'elevated' ? '' : 'p-4 sm:p-6',
    lg: variant === 'default' || variant === 'elevated' ? 'p-6 sm:p-8' : 'p-6 sm:p-8',
    xl: variant === 'default' || variant === 'elevated' ? 'p-8 sm:p-12' : 'p-8 sm:p-12'
  };

  const hoverClasses = hover ? 'hover:shadow-medium hover:-translate-y-1' : '';
  const interactiveClasses = interactive ? 'interactive cursor-pointer' : '';

  const combinedClasses = cn(
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    interactiveClasses,
    className
  );

  return (
    <Component className={combinedClasses}>
      {children}
    </Component>
  );
};

export default ResponsiveCard;