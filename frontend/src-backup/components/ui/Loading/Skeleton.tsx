import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  animated?: boolean;

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  animated = true
}) => {
  const baseClasses = 'bg-gray-200';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'rectangular':
        return 'rounded';
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'h-4 rounded';
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  const shimmerVariants = {
    start: {
      backgroundPosition: '-200px 0'
    },
    end: {
      backgroundPosition: 'calc(200px + 100%) 0'
  };

  const SkeletonElement = ({ isLast = false }: { isLast?: boolean }) => (
    <motion.div
      className={`
        ${baseClasses} 
        ${getVariantClasses()} 
        ${animated ? 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200px_100%]' : ''}
        ${isLast && variant === 'text' ? 'w-3/4' : ''}
        ${className}
      `}
      style={getStyle()}
      {...(animated && {
        variants: shimmerVariants,
        initial: "start",
        animate: "end",
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
      })}
    />
  );

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonElement key={index} isLast={index === lines - 1} />
        ))}
      </div>
    );

  return <SkeletonElement />;
};

// Predefined skeleton components for common use cases
export const CertificateCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" lines={3} />
    <div className="flex justify-between items-center">
      <Skeleton variant="rounded" width={80} height={32} />
      <Skeleton variant="rounded" width={100} height={32} />
    </div>
  </div>
);

export const CertificateListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <CertificateCardSkeleton key={index} />
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <Skeleton variant="text" width="40%" height={32} className="mb-4" />
      <Skeleton variant="text" lines={2} />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="30%" height={24} />
        </div>
      ))}
    </div>

    {/* Content */}
    <CertificateListSkeleton count={4} />
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton variant="text" width="30%" height={20} />
    <Skeleton variant="rounded" width="100%" height={40} />
    <Skeleton variant="text" width="25%" height={20} />
    <Skeleton variant="rounded" width="100%" height={40} />
    <Skeleton variant="text" width="35%" height={20} />
    <Skeleton variant="rounded" width="100%" height={80} />
    <div className="flex space-x-4 pt-4">
      <Skeleton variant="rounded" width={100} height={40} />
      <Skeleton variant="rounded" width={80} height={40} />
    </div>
  </div>
);

export default Skeleton;