import { useState, useCallback, useEffect, useRef } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
  placeholder?: string;
  sizes?: string;
}

interface OptimizedImageState {
  src: string;
  isLoading: boolean;
  hasError: boolean;
  isInView: boolean;
}

export const useImageOptimization = (
  originalSrc: string,
  options: ImageOptimizationOptions = {}
) => {
  const {
    quality = 80,
    format = 'webp',
    lazy = true,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
    sizes = '100vw'
  } = options;

  const [state, setState] = useState<OptimizedImageState>({
    src: lazy ? placeholder : originalSrc,
    isLoading: lazy,
    hasError: false,
    isInView: false
  });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL
  const getOptimizedSrc = useCallback((src: string) => {
    if (!src || src.startsWith('data:')) return src;
    
    // For demo purposes, return original src
    // In production, you'd integrate with image optimization service
    const params = new URLSearchParams({
      q: quality.toString(),
      f: format,
      w: '800' // default width
    });
    
    // Return original for now - in production you'd use something like:
    // return `https://your-image-service.com/optimize?url=${encodeURIComponent(src)}&${params}`;
    return src;
  }, [quality, format]);

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false
    }));
  }, []);

  const handleImageError = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
      src: placeholder
    }));
  }, [placeholder]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState(prev => ({
              ...prev,
              isInView: true,
              src: getOptimizedSrc(originalSrc),
              isLoading: true
            }));
            
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, originalSrc, getOptimizedSrc]);

  // Preload image
  const preloadImage = useCallback((src: string) => {
    const img = new Image();
    img.onload = handleImageLoad;
    img.onerror = handleImageError;
    img.src = src;
  }, [handleImageLoad, handleImageError]);

  // Manual load trigger for non-lazy images
  useEffect(() => {
    if (!lazy && originalSrc) {
      const optimizedSrc = getOptimizedSrc(originalSrc);
      setState(prev => ({
        ...prev,
        src: optimizedSrc,
        isLoading: true
      }));
      preloadImage(optimizedSrc);
    }
  }, [lazy, originalSrc, getOptimizedSrc, preloadImage]);

  // Generate srcSet for responsive images
  const generateSrcSet = useCallback((src: string) => {
    if (!src || src.startsWith('data:')) return '';
    
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(width => {
        const params = new URLSearchParams({
          q: quality.toString(),
          f: format,
          w: width.toString()
        });
        // In production: `https://your-image-service.com/optimize?url=${encodeURIComponent(src)}&${params} ${width}w`
        return `${src} ${width}w`;
      })
      .join(', ');
  }, [quality, format]);

  return {
    ...state,
    imgRef,
    srcSet: generateSrcSet(originalSrc),
    sizes,
    onLoad: handleImageLoad,
    onError: handleImageError,
    preload: preloadImage
  };
};

export default useImageOptimization;