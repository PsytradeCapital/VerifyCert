import React from 'react';
/**
 * Image optimization utilities for lazy loading and performance
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';

/**
 * Generate optimized image URLs with different formats and sizes
 */
export const generateImageSrcSet = (
  baseSrc: string,
  sizes: number[] = [320, 640, 1024, 1280],
  format: 'webp' | 'jpeg' | 'png' = 'webp'
): string => {
  return sizes
    .map(size => {
      const optimizedSrc = optimizeImageUrl(baseSrc, { width: size, format });
      return `${optimizedSrc} ${size}w`;
    })
    .join(', ');
};

/**
 * Generate responsive breakpoints for different screen sizes
 */
export const generateResponsiveBreakpoints = (
  baseSrc: string,
  breakpoints: Array<{ width: number; media: string }> = [
    { width: 320, media: '(max-width: 640px)' },
    { width: 640, media: '(max-width: 1024px)' },
    { width: 1024, media: '(max-width: 1280px)' },
    { width: 1280, media: '(min-width: 1281px)'
  ]
) => {
  return breakpoints.map(({ width, media }) => ({
    media,
    src: optimizeImageUrl(baseSrc, { width }),
    srcSet: generateImageSrcSet(baseSrc, [width, width * 2]), // Include 2x for retina
  }));
};

/**
 * Optimize image URL with parameters
 */
export const optimizeImageUrl = (
  src: string,
  options: ImageOptimizationOptions = {}
): string => {
  const { quality = 80, format, width, height } = options;
  
  // For external images or if no optimization service is available,
  // return original URL
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src;
  
  // Build query parameters for image optimization
  const params = new URLSearchParams();
  
  if (quality !== 80) params.set('q', quality.toString());
  if (format) params.set('f', format);
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  
  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
};

/**
 * Check if WebP is supported by the browser
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Cached WebP support check
 */
let webpSupported: boolean | null = null;

export const isWebPSupported = async (): Promise<boolean> => {
  if (webpSupported !== null) {
    return webpSupported;
  
  webpSupported = await supportsWebP();
  return webpSupported;
};

/**
 * Convert image to WebP format if supported
 */
export const getOptimalImageFormat = async (originalSrc: string): Promise<string> => {
  const isWebPAvailable = await isWebPSupported();
  
  if (!isWebPAvailable || originalSrc.includes('.svg') || originalSrc.startsWith('data:')) {
    return originalSrc;
  
  // For local images, try to find WebP version
  if (!originalSrc.startsWith('http')) {
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // Check if WebP version exists
    try {
      const response = await fetch(webpSrc, { method: 'HEAD' });
      if (response.ok) {
        return webpSrc;
    } catch {
      // WebP version doesn't exist, use original
  
  return originalSrc;
};

/**
 * Generate responsive image props with WebP support
 */
export const getResponsiveImageProps = async (
  src: string,
  alt: string,
  options: ImageOptimizationOptions = {}
) => {
  const { width, height, lazy = true } = options;
  const optimalSrc = await getOptimalImageFormat(src);
  
  return {
    src: optimizeImageUrl(optimalSrc, options),
    srcSet: generateImageSrcSet(optimalSrc),
    sizes: options.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    alt,
    width,
    height,
    loading: lazy ? ('lazy' as const) : ('eager' as const),
    decoding: 'async' as const,
  };
};

/**
 * Generate responsive image props synchronously (for React components)
 */
export const getResponsiveImagePropsSync = (
  src: string,
  alt: string,
  options: ImageOptimizationOptions = {}
) => {
  const { width, height, lazy = true } = options;
  
  return {
    src: optimizeImageUrl(src, options),
    srcSet: generateImageSrcSet(src),
    sizes: options.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    alt,
    width,
    height,
    loading: lazy ? ('lazy' as const) : ('eager' as const),
    decoding: 'async' as const,
  };
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string, options: ImageOptimizationOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = optimizeImageUrl(src, options);
  });
};

/**
 * Batch preload multiple images
 */
export const preloadImages = async (
  images: Array<{ src: string; options?: ImageOptimizationOptions }>
): Promise<void> => {
  const promises = images.map(({ src, options }) => preloadImage(src, options));
  await Promise.allSettled(promises);
};

/**
 * Create a blur placeholder for images
 */
export const createBlurPlaceholder = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  canvas.width = width;
  canvas.height = height;
  
  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(0.5, '#e5e7eb');
  gradient.addColorStop(1, '#d1d5db');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

/**
 * Intersection Observer for lazy loading images
 */
export class LazyImageObserver {
  private observer: IntersectionObserver;
  private images: Set<HTMLImageElement> = new Set();
  
  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
    );
  
  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.observer.unobserve(img);
        this.images.delete(img);
    });
  
  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcSet = img.dataset.srcset;
    
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    
    if (srcSet) {
      img.srcset = srcSet;
      img.removeAttribute('data-srcset');
    
    img.classList.remove('lazy');
    img.classList.add('loaded');
  
  observe(img: HTMLImageElement) {
    this.images.add(img);
    this.observer.observe(img);
  
  unobserve(img: HTMLImageElement) {
    this.images.delete(img);
    this.observer.unobserve(img);
  
  disconnect() {
    this.observer.disconnect();
    this.images.clear();

/**
 * Global lazy image observer instance
 */
export const globalLazyImageObserver = new LazyImageObserver();

/**
 * Image compression utility
 */
export const compressImage = (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  } = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
        },
        format,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Performance monitoring for image loading
 */
export const imagePerformanceMonitor = {
  loadTimes: new Map<string, number>(),
  
  startLoad: (src: string) => {
    imagePerformanceMonitor.loadTimes.set(`${src}_start`, Date.now());
  },
  
  endLoad: (src: string) => {
    const startTime = imagePerformanceMonitor.loadTimes.get(`${src}_start`);
    if (startTime) {
      const loadTime = Date.now() - startTime;
      imagePerformanceMonitor.loadTimes.set(src, loadTime);
      
      // Log slow loading images
      if (loadTime > 3000) {
        console.warn(`Slow image load: ${src} took ${loadTime}ms`);
  },
  
  getStats: () => {
    const stats: Record<string, number> = {};
    imagePerformanceMonitor.loadTimes.forEach((time, src) => {
      if (!src.endsWith('_start')) {
        stats[src] = time;
    });
    return stats;
  },
};
}}}}}}}}}}}}}}}}}}}}}}}}}}