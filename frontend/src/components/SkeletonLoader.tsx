import React from 'react';

interface SkeletonLoaderProps {
variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4';
      case 'rectangular':
        return '';
      case 'circular':
        return 'rounded-full';
      case 'card':
        return 'h-48';
      default:
        return 'h-4';
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? ${width}px : width;
    if (height) style.height = typeof height === 'number' ? ${height}px : height;
    return style;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={${baseClasses} ${getVariantClasses()} ${
              index < lines - 1 ? 'mb-2' : ''
            } ${index === lines - 1 ? 'w-3/4' : ''}}
            style={getStyle()}
          />
        ))}
      </div>
    );

  return (
    <div
      className={${baseClasses} ${getVariantClasses()} ${className}}
      style={getStyle()}
    />
  );
};

// Predefined skeleton components for common use cases
export const CertificateCardSkeleton: React.FC = () => (;
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">;
    <div className="flex items-center space-x-4 mb-4">;
      <SkeletonLoader variant="circular" width={48} height={48} />
      <div className="flex-1">
        <SkeletonLoader variant="text" width="60%" className="mb-2" />
        <SkeletonLoader variant="text" width="40%" />
      </div>
    </div>
    <SkeletonLoader variant="text" lines={3} className="mb-4" />
    <div className="flex justify-between items-center">
      <SkeletonLoader variant="rectangular" width={80} height={32} />
      <SkeletonLoader variant="rectangular" width={100} height={32} />
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

export const DashboardSkeleton: React.FC = () => (;
  <div className="space-y-6">;
    {/* Header */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <SkeletonLoader variant="text" width="40%" height={32} className="mb-4" />
      <SkeletonLoader variant="text" lines={2} />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <SkeletonLoader variant="text" width="60%" className="mb-2" />
          <SkeletonLoader variant="text" width="30%" height={24} />
        </div>
      ))}
    </div>

    {/* Content */}
    <CertificateListSkeleton count={4} />
  </div>
);

export default SkeletonLoader;
}
}