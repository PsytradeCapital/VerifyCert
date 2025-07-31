import React from 'react';
import { motion } from 'framer-motion';
import { cardInteractions } from '../../../utils/interactionAnimations';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  enableAnimations?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
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

  const clickableClasses = onClick ? 'cursor-pointer' : '';
  const isInteractive = hover || onClick;

  // Get animation props based on variant and interaction settings
  const animationProps = enableAnimations && isInteractive 
    ? cardInteractions[variant] || cardInteractions.default
    : {};

  const MotionDiv = motion.div;

  return (
    <MotionDiv
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${clickableClasses}
        ${className}
      `}
      onClick={onClick}
      {...animationProps}
    >
      {children}
    </MotionDiv>
  );
};

export default Card;