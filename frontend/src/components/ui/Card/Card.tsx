import React from 'react';
import { motion } from 'framer-motion';
import { cardInteractions } from '../../../utils/interactionAnimations';
import { generateAriaId } from '../../../utils/ariaUtils';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
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
  hover = false,
  className = '',
  onClick,
  onKeyDown,
  tabIndex,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  enableAnimations = true
}) => {
  const baseClasses = 'bg-white rounded-lg';
  
  const variantClasses = {
    default: 'border border-gray-200',
    elevated: 'shadow-md',
    outlined: 'border-2 border-gray-300'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const clickableClasses = onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : '';
  const isInteractive = hover || onClick;

  // Handle keyboard events for interactive cards
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
    onKeyDown?.(event);
  };

  // Get animation props based on variant and interaction settings
  const animationProps = enableAnimations && isInteractive 
    ? cardInteractions[variant] || cardInteractions.default
    : {};

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
      ${clickableClasses}
      ${className}
    `,
    onClick,
    onKeyDown: onClick || onKeyDown ? handleKeyDown : undefined,
    tabIndex: onClick ? (tabIndex !== undefined ? tabIndex : 0) : tabIndex,
    role: onClick ? (role || 'button') : role,
    'aria-label': ariaLabel || (onClick ? 'Interactive card' : undefined),
    'aria-describedby': descriptionId,
    ...animationProps
  };

  return (
    <MotionDiv {...cardProps}>
      {onClick && !ariaDescribedBy && (
        <div id={descriptionId} className="sr-only">
          Interactive card. Press Enter or Space to activate.
        </div>
      )}
      {children}
    </MotionDiv>
  );
};

export default Card;