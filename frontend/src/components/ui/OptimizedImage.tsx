import React, { useState, useEffect, useRef } from 'react';
import { 
  getOptimalImageFormat, 
  generateImageSrcSet, 
  optimizeImageUrl,
  imagePerformanceMonitor,
  createBlurPlaceholder,
  ImageOptimizationOptions;;
} from '../../utils/imageOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ retry: () => void }>;
  observerOptions?: IntersectionObserverInit;
  optimization?: ImageOptimizationOptions;
  responsive?: boolean;
  webpFallback?: boolean;
  blurPlaceholder?: boolean;
  aspectRatio?: 'square' | 'video' | 'photo' | 'auto';
  priority?: boolean; // For above-the-fold images

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  observerOptions,
  optimization = {},
  responsive = true,
  webpFallback = true,
  blurPlaceholder = false,
  aspectRatio = 'auto',
  priority = false,
  className = '',
  style,
  ...props
}) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string | undefined>();
  const [currentSrcSet, setCurrentSrcSet] = useState<string | undefined>();
  const [isInView, setIsInView] = useState(priority); // Priority images load immediately
  const [blurDataUrl, setBlurDataUrl] = useState<string | undefined>();
  const imgRef = useRef<HTMLImageElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    auto: ''
  };

  // Generate blur placeholder
  useEffect(() => {
    if (blurPlaceholder && optimization.width && optimization.height) {
      const placeholder = createBlurPlaceholder(optimization.width, optimization.height);
      setBlurDataUrl(placeholder);
  }, [blurPlaceholder, optimization.width, optimization.height]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip observer for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...observerOptions,
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority, observerOptions]);

  // Load optimized image when in view
  useEffect(() => {
    if (!isInView) return;

    const loadOptimizedImage = async () => {
      imagePerformanceMonitor.startLoad(src);

      try {
        // Get optimal format (WebP if supported)
        const optimalSrc = webpFallback ? await getOptimalImageFormat(src) : src;
        const optimizedSrc = optimizeImageUrl(optimalSrc, optimization);
        
        // Generate srcSet for responsive images
        const srcSet = responsive ? generateImageSrcSet(optimalSrc) : undefined;

        // Preload the image
        const img = new Image();
        
        img.onload = () => {
          setCurrentSrc(optimizedSrc);
          setCurrentSrcSet(srcSet);
          setLoadState('loaded');
          imagePerformanceMonitor.endLoad(src);
        };
        
        img.onerror = async () => {
          // Try fallback image if available
          if (fallbackSrc && fallbackSrc !== optimalSrc) {
            try {
              const fallbackOptimal = webpFallback ? await getOptimalImageFormat(fallbackSrc) : fallbackSrc;
              const fallbackOptimized = optimizeImageUrl(fallbackOptimal, optimization);
              
              const fallbackImg = new Image();
              fallbackImg.onload = () => {
                setCurrentSrc(fallbackOptimized);
                setCurrentSrcSet(responsive ? generateImageSrcSet(fallbackOptimal) : undefined);
                setLoadState('loaded');
                imagePerformanceMonitor.endLoad(src);
              };
              fallbackImg.onerror = () => {
                setLoadState('error');
                imagePerformanceMonitor.endLoad(src);
              };
              fallbackImg.src = fallbackOptimized;
            } catch {
              setLoadState('error');
              imagePerformanceMonitor.endLoad(src);
          } else {
            setLoadState('error');
            imagePerformanceMonitor.endLoad(src);
        };
        
        img.src = optimizedSrc;
        if (srcSet) {
          img.srcset = srcSet;
      } catch (error) {
        console.error('Image optimization failed:', error);
        setLoadState('error');
        imagePerformanceMonitor.endLoad(src);
    };

    loadOptimizedImage();
  }, [isInView, src, fallbackSrc, optimization, responsive, webpFallback]);

  const retry = () => {
    setLoadState('loading');
    setCurrentSrc(undefined);
    setCurrentSrcSet(undefined);
    // Trigger reload
    setIsInView(false);
    setTimeout(() => setIsInView(true), 100);
  };

  // Loading state
  if (loadState === 'loading' || !isInView) {
    return (
      <div 
        ref={imgRef}
        className={`${className} ${aspectRatioClasses[aspectRatio]} flex items-center justify-center overflow-hidden`}
        style={{
          backgroundImage: blurDataUrl ? `url(${blurDataUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ...style
        }}
        {...props}
      >
        {LoadingComponent ? (
          <LoadingComponent />
        ) : (
          <div className="bg-gray-200 animate-pulse w-full h-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        )}
      </div>
    );

  // Error state
  if (loadState === 'error') {
    return (
      <div 
        className={`${className} ${aspectRatioClasses[aspectRatio]} bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4`}
        style={style}
        {...props}
      >
        {ErrorComponent ? (
          <ErrorComponent retry={retry} />
        ) : (
          <>
            <svg 
              className="w-8 h-8 text-gray-400 mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <p className="text-sm text-gray-500 mb-2 text-center">Failed to load image</p>
            <button
              onClick={retry}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          </>
        )}
      </div>
    );

  // Loaded state
  return (
    <img
      ref={imgRef}
      src={currentSrc}
      srcSet={currentSrcSet}
      sizes={responsive ? optimization.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined}
      alt={alt}
      className={`${className} ${aspectRatioClasses[aspectRatio]} transition-opacity duration-300 opacity-100`}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
};

/**
 * Picture element with WebP and fallback support
 */
interface ResponsivePictureProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  optimization?: ImageOptimizationOptions;
  breakpoints?: Array<{
    media: string;
    src: string;
    sizes?: string;
  }>;
  webpSources?: boolean;

export const ResponsivePicture: React.FC<ResponsivePictureProps> = ({
  src,
  alt,
  className = '',
  style,
  optimization = {},
  breakpoints = [],
  webpSources = true,
  ...props
}) => {
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebPSupport = async () => {
      const { isWebPSupported } = await import('../../utils/imageOptimization');
      const supported = await isWebPSupported();
      setWebpSupported(supported);
    };

    checkWebPSupport();
  }, []);

  if (webpSupported === null) {
    // Loading state
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`} style={style}>
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );

  const getWebPSrc = (originalSrc: string) => {
    return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  return (
    <picture>
      {/* WebP sources for different breakpoints */}
      {webpSources && webpSupported && breakpoints.map((breakpoint, index) => (
        <source
          key={`webp-${index}`}
          media={breakpoint.media}
          srcSet={generateImageSrcSet(getWebPSrc(breakpoint.src), undefined, 'webp')}
          sizes={breakpoint.sizes}
          type="image/webp"
        />
      ))}
      
      {/* WebP source for main image */}
      {webpSources && webpSupported && (
        <source
          srcSet={generateImageSrcSet(getWebPSrc(src), undefined, 'webp')}
          sizes={optimization.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          type="image/webp"
        />
      )}

      {/* Fallback sources for different breakpoints */}
      {breakpoints.map((breakpoint, index) => (
        <source
          key={`fallback-${index}`}
          media={breakpoint.media}
          srcSet={generateImageSrcSet(breakpoint.src)}
          sizes={breakpoint.sizes}
        />
      ))}

      {/* Fallback img element */}
      <img
        src={optimizeImageUrl(src, optimization)}
        srcSet={generateImageSrcSet(src)}
        sizes={optimization.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        alt={alt}
        className={className}
        style={style}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
}}}}}}}}}}}}}