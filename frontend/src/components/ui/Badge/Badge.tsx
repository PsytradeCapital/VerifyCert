import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
}
}
}
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  outline?: boolean;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(;;
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    rounded = false,
    outline = false,
    icon,
    removable = false,
    onRemove,
    children,
    onClick,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    const variants = {
      default: outline ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50' : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      success: outline ? 'border border-green-300 text-green-700 bg-white hover:bg-green-50' : 'bg-green-100 text-green-800 hover:bg-green-200',
      error: outline ? 'border border-red-300 text-red-700 bg-white hover:bg-red-50' : 'bg-red-100 text-red-800 hover:bg-red-200',
      warning: outline ? 'border border-yellow-300 text-yellow-700 bg-white hover:bg-yellow-50' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      info: outline ? 'border border-blue-300 text-blue-700 bg-white hover:bg-blue-50' : 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      secondary: outline ? 'border border-gray-300 text-gray-600 bg-white hover:bg-gray-50' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-2.5 py-1.5 text-sm',
      lg: 'px-3 py-2 text-base',
    };

    const isClickable = onClick || removable;

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          rounded ? 'rounded-full' : 'rounded-md',
          isClickable && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>
        {children}
        {removable && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    );
);

Badge.displayName = 'Badge';
}