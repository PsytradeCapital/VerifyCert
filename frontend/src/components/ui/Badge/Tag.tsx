import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface TagProps {
  children: React.ReactNode;
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  icon?: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({
  children,
  color = 'gray',
  size = 'md',
  className = '',
  onClick,
  onRemove,
  removable = false,
  icon
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-all duration-200';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    red: 'bg-red-100 text-red-800 hover:bg-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200'
  };

  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-md' : '';

  const tagClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${colorClasses[color]}
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

  const TagContent = (
    <>
      {icon && (
        <span className={`${children ? 'mr-1.5' : ''} flex-shrink-0`}>
          {React.cloneElement(icon as React.ReactElement, {
            className: `w-3 h-3 ${size === 'lg' ? 'w-4 h-4' : ''}`
          })}
        </span>
      )}
      <span className="truncate">{children}</span>
      {removable && (
        <button
          onClick={handleRemove}
          className={`
            ml-1.5 flex-shrink-0 hover:bg-black hover:bg-opacity-10 
            rounded-full p-0.5 transition-colors focus:outline-none
            ${size === 'sm' ? 'ml-1' : ''}
          `}
          aria-label="Remove tag"
        >
          <X className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <motion.button
        className={tagClasses}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {TagContent}
      </motion.button>
    );
  }

  return (
    <motion.span
      className={tagClasses}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {TagContent}
    </motion.span>
  );
};

export default Tag;