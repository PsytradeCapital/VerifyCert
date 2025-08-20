import React from 'react';
/**
 * Performance monitoring utilities for lazy loading and bundle optimization
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();

  private initializeObservers() {
    // Monitor resource loading (images, scripts, etc.)
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.recordResourceLoad(entry as PerformanceResourceTiming);
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource performance observer not supported:', error);

      // Monitor navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordNavigationTiming(entry as PerformanceNavigationTiming);
        });
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (error) {
        console.warn('Navigation performance observer not supported:', error);

  private recordResourceLoad(entry: PerformanceResourceTiming) {
    const isLazyResource = entry.name.includes('lazy') || 
                          entry.name.includes('chunk') ||
                          entry.initiatorType === 'img';

    if (isLazyResource) {
      this.metrics.set(`resource_${entry.name}`, {
        name: entry.name,
        startTime: entry.startTime,
        endTime: entry.responseEnd,
        duration: entry.duration,
        metadata: {
          type: entry.initiatorType,
          size: entry.transferSize,
          cached: entry.transferSize === 0,
        },
      });

  private recordNavigationTiming(entry: PerformanceNavigationTiming) {
    this.metrics.set('navigation', {
      name: 'navigation',
      startTime: entry.startTime,
      endTime: entry.loadEventEnd,
      duration: entry.loadEventEnd - entry.startTime,
      metadata: {
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
      },
    });

  private getFirstPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime;

  private getFirstContentfulPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint?.startTime;

  // Manual timing methods
  startTiming(name: string, metadata?: Record<string, any>) {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });

  endTiming(name: string, additionalMetadata?: Record<string, any>) {
    const metric = this.metrics.get(name);
    if (metric) {
      const endTime = performance.now();
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      
      if (additionalMetadata) {
        metric.metadata = { ...metric.metadata, ...additionalMetadata };

  // Component lazy loading timing
  startComponentLoad(componentName: string) {
    this.startTiming(`component_${componentName}`, { type: 'component' });

  endComponentLoad(componentName: string, success: boolean = true) {
    this.endTiming(`component_${componentName}`, { success });

  // Image lazy loading timing
  startImageLoad(imageSrc: string) {
    this.startTiming(`image_${imageSrc}`, { type: 'image' });

  endImageLoad(imageSrc: string, success: boolean = true, size?: number) {
    this.endTiming(`image_${imageSrc}`, { success, size });

  // Bundle loading timing
  startBundleLoad(bundleName: string) {
    this.startTiming(`bundle_${bundleName}`, { type: 'bundle' });

  endBundleLoad(bundleName: string, success: boolean = true) {
    this.endTiming(`bundle_${bundleName}`, { success });

  // Get performance statistics
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());

  getMetricsByType(type: string): PerformanceMetric[] {
    return this.getMetrics().filter(metric => 
      metric.metadata?.type === type || metric.name.startsWith(type)
    );

  getSlowMetrics(threshold: number = 1000): PerformanceMetric[] {
    return this.getMetrics().filter(metric => 
      metric.duration && metric.duration > threshold
    );

  // Performance summary
  getSummary() {
    const metrics = this.getMetrics();
    const components = this.getMetricsByType('component');
    const images = this.getMetricsByType('image');
    const bundles = this.getMetricsByType('bundle');

    return {
      total: metrics.length,
      components: {
        count: components.length,
        averageLoadTime: this.calculateAverage(components),
        slowest: this.getSlowest(components),
      },
      images: {
        count: images.length,
        averageLoadTime: this.calculateAverage(images),
        slowest: this.getSlowest(images),
      },
      bundles: {
        count: bundles.length,
        averageLoadTime: this.calculateAverage(bundles),
        slowest: this.getSlowest(bundles),
      },
      navigation: this.metrics.get('navigation'),
    };

  private calculateAverage(metrics: PerformanceMetric[]): number {
    const validMetrics = metrics.filter(m => m.duration);
    if (validMetrics.length === 0) return 0;
    
    const sum = validMetrics.reduce((acc, m) => acc + (m.duration || 0), 0);
    return sum / validMetrics.length;

  private getSlowest(metrics: PerformanceMetric[]): PerformanceMetric | undefined {
    return metrics
      .filter(m => m.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))[0];

  // Export data for analysis
  exportData(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      metrics: this.getMetrics(),
      summary: this.getSummary(),
    }, null, 2);

  // Clear metrics
  clear() {
    this.metrics.clear();

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common performance monitoring patterns
export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    performanceMonitor.startTiming(name);
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result && typeof result.then === 'function') {
        return result
          .then((value: any) => {
            performanceMonitor.endTiming(name, { success: true });
            return value;
          })
          .catch((error: any) => {
            performanceMonitor.endTiming(name, { success: false, error: error.message });
            throw error;
          });
      
      performanceMonitor.endTiming(name, { success: true });
      return result;
    } catch (error) {
      performanceMonitor.endTiming(name, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
  }) as T;
};

// Note: React hook for component performance monitoring moved to hooks/usePerformanceMonitoring.ts

// Performance monitoring for lazy loading
export const monitorLazyLoading = {
  component: (name: string) => ({
    onStart: () => performanceMonitor.startComponentLoad(name),
    onEnd: (success: boolean = true) => performanceMonitor.endComponentLoad(name, success),
  }),
  
  image: (src: string) => ({
    onStart: () => performanceMonitor.startImageLoad(src),
    onEnd: (success: boolean = true, size?: number) => performanceMonitor.endImageLoad(src, success, size),
  }),
  
  bundle: (name: string) => ({
    onStart: () => performanceMonitor.startBundleLoad(name),
    onEnd: (success: boolean = true) => performanceMonitor.endBundleLoad(name, success),
  }),
};

// Development helpers
export const logPerformanceStats = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚀 Performance Statistics');
    console.table(performanceMonitor.getSummary());
    
    const slowMetrics = performanceMonitor.getSlowMetrics();
    if (slowMetrics.length > 0) {
      console.warn('⚠️ Slow loading resources:', slowMetrics);
    
    console.groupEnd();
};

// Auto-log performance stats in development
if (process.env.NODE_ENV === 'development') {
  // Log stats after page load
  window.addEventListener('load', () => {
    setTimeout(logPerformanceStats, 2000);
  });


}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}