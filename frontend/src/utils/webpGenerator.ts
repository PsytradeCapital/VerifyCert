import React from 'react';
/**
 * WebP generation utilities for client-side image optimization
 */

/**
 * Convert an image to WebP format using Canvas API
 */
export const convertToWebP = (
  imageElement: HTMLImageElement,;
  quality: number = 0.8;;
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    
    ctx.drawImage(imageElement, 0, 0);
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert to WebP'));
      },
      'image/webp',
      quality
    );
  });
};

/**
 * Check if an image can be converted to WebP
 */
export const canConvertToWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    const dataUrl = canvas.toDataURL('image/webp');
    return dataUrl.startsWith('data:image/webp');
  } catch {
    return false;
};

/**
 * Generate multiple sizes of an image in WebP format
 */
export const generateResponsiveWebP = async (
  imageElement: HTMLImageElement,
  sizes: number[] = [320, 640, 1024, 1280],;
  quality: number = 0.8;;
): Promise<Array<{ size: number; blob: Blob; url: string }>> => {
  const results: Array<{ size: number; blob: Blob; url: string }> = [];
  
  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) continue;
    
    // Calculate dimensions maintaining aspect ratio
    const aspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    const width = size;
    const height = Math.round(size / aspectRatio);
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/webp',
          quality
        );
      });
      
      const url = URL.createObjectURL(blob);
      results.push({ size, blob, url });
    } catch (error) {
      console.warn(`Failed to generate WebP for size ${size}:`, error);
  
  return results;
};

/**
 * Preload and convert existing images to WebP
 */
export const preloadAndConvertImages = async (;
  imagePaths: string[];;
): Promise<Map<string, string>> => {
  const webpUrls = new Map<string, string>();
  
  if (!canConvertToWebP()) {
    console.warn('WebP conversion not supported in this browser');
    return webpUrls;
  
  for (const imagePath of imagePaths) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load ${imagePath}`));
        img.src = imagePath;
      });
      
      const webpBlob = await convertToWebP(img, 0.8);
      const webpUrl = URL.createObjectURL(webpBlob);
      webpUrls.set(imagePath, webpUrl);
      
      console.log(`✓ Converted to WebP: ${imagePath}`);
    } catch (error) {
      console.warn(`Failed to convert ${imagePath}:`, error);
  
  return webpUrls;
};

/**
 * Create a WebP cache for frequently used images
 */
class WebPCache {
  private cache = new Map<string, string>();
  private converting = new Set<string>();
  
  async getWebPUrl(originalUrl: string): Promise<string> {
    // Return cached version if available
    if (this.cache.has(originalUrl)) {
      return this.cache.get(originalUrl)!;
    
    // Return original if already converting
    if (this.converting.has(originalUrl)) {
      return originalUrl;
    
    // Check if WebP conversion is supported
    if (!canConvertToWebP()) {
      return originalUrl;
    
    try {
      this.converting.add(originalUrl);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = originalUrl;
      });
      
      const webpBlob = await convertToWebP(img, 0.8);
      const webpUrl = URL.createObjectURL(webpBlob);
      
      this.cache.set(originalUrl, webpUrl);
      return webpUrl;
    } catch (error) {
      console.warn(`Failed to convert ${originalUrl} to WebP:`, error);
      return originalUrl;
    } finally {
      this.converting.delete(originalUrl);
  
  clear() {
    // Revoke all object URLs to free memory
    this.cache.forEach(url => URL.revokeObjectURL(url));
    this.cache.clear();
  
  size() {
    return this.cache.size;

export const webpCache = new WebPCache();

/**
 * Initialize WebP conversion for common images
 */
export const initializeWebPOptimization = async () => {
  const commonImages = [
    '/icon-192.png',
    '/icon-512.png',
    '/screenshot-narrow.png',
    '/screenshot-wide.png',
    '/icon.svg' // SVGs don't need WebP conversion but we'll cache them
  ];
  
  console.log('Initializing WebP optimization...');
  
  // Pre-convert PNG images to WebP
  const pngImages = commonImages.filter(img => img.endsWith('.png'));
  
  for (const imagePath of pngImages) {
    try {
      await webpCache.getWebPUrl(imagePath);
    } catch (error) {
      console.warn(`Failed to pre-convert ${imagePath}:`, error);
  
  console.log(`WebP optimization initialized. Cached ${webpCache.size()} images.`);
};

/**
 * Cleanup WebP cache on page unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    webpCache.clear();
  });
}
}}}}}}}}}}}}}}}}}}