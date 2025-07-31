import React from 'react';
import { motion } from 'framer-motion';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  outline?: boolean;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  outline = false,
  className = '',
  onClick,
  icon,
  removable = false,
  onRemove
}) => {
  const baseClasses = 'inline-flex items-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  const variantClasses = {
    default: outline 
      ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
      : 'text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500',
    success: outline
      ? 'text-green-700 bg-white border border-green-300 hover:bg-green-50 focus:ring-green-500'
      : 'text-green-800 bg-green-100 hover:bg-green-200 focus:ring-green-500',
    error: outline
      ? 'text-red-700 bg-white border border-red-300 hover:bg-red-50 focus:ring-red-500'
      : 'text-red-800 bg-red-100 hover:bg-red-200 focus:ring-red-500',
    warning: outline
      ? 'text-yellow-700 bg-white border border-yellow-300 hover:bg-yellow-50 focus:ring-yellow-500'
      : 'text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500',
    info: outline
      ? 'text-blue-700 bg-white border border-blue-300 hover:bg-blue-50 focus:ring-blue-500'
      : 'text-blue-800 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500',
    secondary: outline
      ? 'text-purple-700 bg-white border border-purple-300 hover:bg-purple-50 focus:ring-purple-500'
      : 'text-purple-800 bg-purple-100 hover:bg-purple-200 focus:ring-purple-500'
  };

  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const badgeClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${roundedClasses}
    ${clickableClasses}
    ${className}
  `.trim();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  const BadgeContent = (
    <>
      {icon && (
        <span className={`${children ? 'mr-1' : ''} flex-shrink-0`}>
          {icon}
        </span>
      )}
      {children}
      {removable && (
        <button
          onClick={handleRemove}
          className="ml-1 flex-shrink-0 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
          aria-label="Remove badge"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <motion.button
        className={badgeClasses}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {BadgeContent}
      </motion.button>
    );
  }

  return (
    <span className={badgeClasses}>
      {BadgeContent}
    </span>
  );
};

export default Badge;