import React from 'react';
import { LazyImage } from '../../utils/lazyLoading';
import { OptimizedImage } from './OptimizedImage';

/**
 * Lazy-loaded logo component
 */
interface LazyLogoProps {
}
}
}
  className?: string;
  alt?: string;

export const LazyLogo: React.FC<LazyLogoProps> = ({ 
  className = "h-8 w-auto", 
  alt = "VerifyCert Logo" 
}) => {
  return (
    <OptimizedImage
      src="/icon.svg"
      alt={alt}
      className={className}
      fallbackSrc="/favicon.ico"
      webpFallback={false} // SVGs don't need WebP conversion
      priority={true} // Logo is above the fold
      loadingComponent={() => (
        <div className={`bg-gray-200 animate-pulse rounded ${className}`}>
          <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          </svg>
        </div>
      )}
      errorComponent={({ retry }) => (
        <div className={`bg-gray-100 border border-gray-300 rounded flex items-center justify-center ${className}`}>
          <button onClick={retry} className="text-gray-500 hover:text-gray-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </button>
        </div>
      )}
    />
  );
};

/**
 * Lazy-loaded screenshot component for PWA
 */
interface LazyScreenshotProps {
}
}
}
  type: 'narrow' | 'wide';
  className?: string;

export const LazyScreenshot: React.FC<LazyScreenshotProps> = ({ 
  type, 
  className = "w-full h-auto rounded-lg shadow-lg" 
}) => {
  const src = type === 'narrow' ? '/screenshot-narrow.png' : '/screenshot-wide.png';
  
  return (
    <OptimizedImage
      src={src}
      alt={`VerifyCert ${type} screenshot`}
      className={className}
      responsive={true}
      webpFallback={true}
      aspectRatio="photo"
      optimization={{
        quality: 85,
        sizes: type === 'narrow' 
          ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px'
          : '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px'
      }}
      loadingComponent={() => (
        <div className={`bg-gray-200 animate-pulse ${className}`}>
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
      errorComponent={({ retry }) => (
        <div className={`bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 ${className}`}>
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-gray-600 mb-2">Failed to load screenshot</p>
          <button
            onClick={retry}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Retry
          </button>
        </div>
      )}
    />
  );
};

/**
 * Lazy-loaded icon component for PWA icons
 */
interface LazyIconProps {
}
}
}
  size: 192 | 512;
  className?: string;

export const LazyIcon: React.FC<LazyIconProps> = ({ 
  size, 
  className = "w-16 h-16 rounded-lg" 
}) => {
  return (
    <OptimizedImage
      src={`/icon-${size}.png`}
      alt={`VerifyCert ${size}x${size} icon`}
      className={className}
      fallbackSrc="/icon.svg"
      responsive={true}
      webpFallback={true}
      aspectRatio="square"
      optimization={{
        width: size,
        height: size,
        quality: 90, // Higher quality for icons
        sizes: `${size}px`
      }}
      loadingComponent={() => (
        <div className={`bg-gray-200 animate-pulse ${className}`}>
          <div className="flex items-center justify-center h-full">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
        </div>
      )}
      errorComponent={({ retry }) => (
        <div className={`bg-gray-100 border border-gray-300 rounded flex items-center justify-center ${className}`}>
          <button onClick={retry} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </button>
        </div>
      )}
    />
  );
};

/**
 * Generic lazy image with common patterns
 */
interface LazyImageWithPlaceholderProps {
}
}
}
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'photo';
  showRetry?: boolean;

export const LazyImageWithPlaceholder: React.FC<LazyImageWithPlaceholderProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = 'photo',
  showRetry = true
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${className} object-cover`}
      aspectRatio={aspectRatio}
      responsive={true}
      webpFallback={true}
      blurPlaceholder={true}
      optimization={{
        quality: 80,
        sizes: aspectRatio === 'square' 
          ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
          : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
      }}
      loadingComponent={() => (
        <div className={`bg-gray-200 animate-pulse ${className} flex items-center justify-center`}>
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      errorComponent={({ retry }) => (
        <div className={`bg-gray-100 border-2 border-dashed border-gray-300 ${className} flex flex-col items-center justify-center p-4`}>
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs text-gray-500 text-center mb-2">Image failed to load</p>
          {showRetry && (
            <button
              onClick={retry}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          )}
        </div>
      )}
    />
  );
};
}}}}