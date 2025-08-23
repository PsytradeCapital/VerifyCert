import React from 'react';
import { cn } from '../../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
}
}
}
}
}
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  enableAnimations?: boolean;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, enableAnimations = true, ...props }, ref) => {
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

    const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variants[variant],
          paddingVariants[padding],
          hoverClasses,
          className
        )}
        {...props}
      />
    );
);

Card.displayName = 'Card';

export default Card;
}}