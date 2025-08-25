import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'rectangular'
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height="1rem"
          width={index === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
};

export default Skeleton;