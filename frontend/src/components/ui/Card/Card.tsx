import React from 'react';
import { motion } from 'framer-motion';
import { cardInteractions } from '../../../utils/interactionAnimations';
import { generateAriaId } from '../../../utils/ariaUtils';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'gradient' | 'glass';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  enableAnimations?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  shadow = 'none',
  hover = false,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  onKeyDown,
  tabIndex,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  enableAnimations = true
}) => {
  const baseClasses = 'transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border-2 border-gray-300',
    ghost: 'bg-gray-50 border border-gray-100',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg'
  };

  const paddingClasses = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };

  const clickableClasses = onClick && !disabled ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : '';
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : '';
  const hoverClasses = hover && !disabled ? 'hover:shadow-lg hover:-translate-y-1' : '';
  const isInteractive = (hover || onClick) && !disabled;

  // Handle keyboard events for interactive cards
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
    onKeyDown?.(event);
  };

  const handleClick = () => {
    if (onClick && !disabled && !loading) {
      onClick();
    }
  };

  // Get animation props based on variant and interaction settings
  const animationProps = enableAnimations && isInteractive ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  } : {};

  const MotionDiv = motion.div;
  
  // Generate unique ID for aria-describedby if needed
  const cardId = generateAriaId('card');
  const descriptionId = ariaDescribedBy || (onClick ? `${cardId}-description` : undefined);

  // Determine appropriate ARIA attributes and tab index
  const cardProps = {
    id: cardId,
    className: `
      ${baseClasses}
      ${variantClasses[variant]}
      ${paddingClasses[padding]}
      ${roundedClasses[rounded]}
      ${shadowClasses[shadow]}
      ${clickableClasses}
      ${disabledClasses}
      ${hoverClasses}
      ${className}
    `,
    onClick: handleClick,
    onKeyDown: onClick || onKeyDown ? handleKeyDown : undefined,
    tabIndex: onClick ? (tabIndex !== undefined ? tabIndex : (disabled ? -1 : 0)) : tabIndex,
    role: onClick ? (role || 'button') : role,
    'aria-label': ariaLabel || (onClick ? 'Interactive card' : undefined),
    'aria-describedby': descriptionId,
    'aria-disabled': disabled,
    ...animationProps
  };

  return (
    <MotionDiv {...cardProps}>
      {onClick && !ariaDescribedBy && (
        <div id={descriptionId} className="sr-only">
          Interactive card. Press Enter or Space to activate.
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div className={loading ? 'opacity-50' : ''}>
        {children}
      </div>
    </MotionDiv>
  );
};

export default Card;