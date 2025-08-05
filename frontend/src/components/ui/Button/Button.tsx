import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  enableAnimations?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'md',
  className = '',
  disabled,
  enableAnimations = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-pressed': ariaPressed,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-300 disabled:hover:bg-blue-300',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-gray-50',
    tertiary: 'bg-transparent hover:bg-gray-50 text-blue-600 focus:ring-blue-500 disabled:text-blue-300 disabled:hover:bg-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-300 disabled:hover:bg-red-300',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 disabled:bg-green-300 disabled:hover:bg-green-300',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 disabled:bg-yellow-300 disabled:hover:bg-yellow-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 disabled:text-gray-400 disabled:hover:bg-transparent',
    outline: 'bg-transparent border-2 border-blue-600 hover:bg-blue-50 text-blue-600 focus:ring-blue-500 disabled:border-blue-300 disabled:text-blue-300 disabled:hover:bg-transparent'
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || loading;

  const animationProps = enableAnimations && !isDisabled ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
  } : {};

  return (
    <motion.button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${widthClass}
        ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      {...animationProps}
      {...props}
    >
      {loading && (
        <Loader2 className={`animate-spin ${iconSizeClasses[size]} ${children || loadingText ? 'mr-2' : ''}`} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={`${children ? 'mr-2' : ''}`}>
          {icon}
        </span>
      )}
      
      {loading && loadingText ? loadingText : children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={`${children ? 'ml-2' : ''}`}>
          {icon}
        </span>
      )}
    </motion.button>
  );
};

export default Button;