import React from 'react';
import { motion } from 'framer-motion';
import Spinner from './Spinner';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}
}
}
}
}
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const spinnerSizes = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  };

  const buttonVariants = {
    idle: { scale: 1 },
    loading: { scale: 0.98 },
    tap: { scale: 0.95
  };

  return (
    <motion.button
      className={${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}}
      disabled={disabled || loading}
      variants={buttonVariants}
      initial="idle"
      animate={loading ? "loading" : "idle"}
      whileTap={!loading && !disabled ? "tap" : undefined}
      transition={{ duration: 0.1 }
      {...props}
    >
      {loading && (
        <Spinner 
          size={spinnerSizes[size]}
          color={variant === 'outline' || variant === 'ghost' ? 'gray' : 'white'}
          className="mr-2"
        />
      )}
      <motion.span
        initial={{ opacity: 1 }
        animate={{ opacity: loading ? 0.7 : 1 }
        transition={{ duration: 0.2 }
      >
        {loading && loadingText ? loadingText : children}
      </motion.span>
    </motion.button>
  );
};

export default LoadingButton;
}