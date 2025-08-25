import React from 'react';

interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const dotClass = `${sizeClasses[size]} bg-current rounded-full animate-pulse`;

  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`${dotClass} animation-delay-0`}></div>
      <div className={`${dotClass} animation-delay-150`}></div>
      <div className={`${dotClass} animation-delay-300`}></div>
    </div>
  );
};

export default DotsSpinner;