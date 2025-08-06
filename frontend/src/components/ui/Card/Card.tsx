import React from 'react';
import { cn } from '../../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-card text-card-foreground shadow-sm',
      elevated: 'bg-card text-card-foreground shadow-lg',
      outlined: 'bg-card text-card-foreground border border-border',
    };

    const paddingVariants = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variants[variant],
          paddingVariants[padding],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export default Card;