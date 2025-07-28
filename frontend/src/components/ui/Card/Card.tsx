import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'border border-gray-200',
    elevated: 'shadow-md hover:shadow-lg',
    outlined: 'border-2 border-gray-300'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${clickableClasses}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;