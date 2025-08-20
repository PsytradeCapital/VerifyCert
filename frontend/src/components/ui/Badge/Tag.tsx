import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ 
    className, 
    color = 'gray', 
    size = 'md',
    icon,
    removable = false,
    onRemove,
    children,
    onClick,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    const colors = {
      gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      red: 'bg-red-100 text-red-800 hover:bg-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      green: 'bg-green-100 text-green-800 hover:bg-green-200',
      blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
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
          colors[color],
          sizes[size],
          isClickable && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {icon && <span className="mr-1 flex-shrink-0">{icon}</span>
        {children}
        {removable && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    );
);

Tag.displayName = 'Tag';
}}}