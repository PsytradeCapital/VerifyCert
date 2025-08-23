import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}
const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  isLoading = false, 
  children, 
  disabled,
  className = '',
  ...props 
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`relative ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

export default LoadingButton;