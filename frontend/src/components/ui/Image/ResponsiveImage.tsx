import React from 'react';
import { cn } from '../../../styles/utils';
import { useResponsive } from '../../../hooks/useResponsive';

export interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'photo' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'auto',
  objectFit = 'cover',
  sizes,
  srcSet,
  loading = 'lazy',
  priority = false,
  placeholder,
  fallback,
  onLoad,
  onError,
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-photo',
    auto: ''
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down'
  };

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (() => {
    if (isMobile) return '100vw';
    if (isTablet) return '50vw';
    return '33vw';
  })();

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setImageError(false);
    onError?.();
  };

  const imageClasses = cn(
    'img-responsive transition-opacity duration-300',
    aspectRatioClasses[aspectRatio],
    objectFitClasses[objectFit],
    imageLoaded ? 'opacity-100' : 'opacity-0',
    className
  );

  const containerClasses = cn(
    'relative overflow-hidden',
    aspectRatioClasses[aspectRatio],
    !imageLoaded && placeholder && 'bg-gray-200'
  );

  return (
    <div className={containerClasses}>
      {/* Placeholder */}
      {!imageLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {typeof placeholder === 'string' ? (
            <div className="text-gray-400 text-sm">{placeholder}</div>
          ) : (
            placeholder
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {!imageLoaded && !placeholder && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}

      {/* Main image */}
      {!imageError && (
        <img
          src={currentSrc}
          alt={alt}
          className={imageClasses}
          sizes={responsiveSizes}
          srcSet={srcSet}
          loading={priority ? 'eager' : loading}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Error fallback */}
      {imageError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-xs">Image not available</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveImage;