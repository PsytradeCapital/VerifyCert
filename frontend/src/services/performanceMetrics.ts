import React from 'react';
import { performanceMonitor } from '../utils/performanceMonitoring';

export interface WebVitalsMetrics {
FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte

export interface CustomMetrics {
}
}
}
  bundleLoadTime: number;
  componentLoadTime: number;
  imageLoadTime: number;
  apiResponseTime: number;
  routeChangeTime: number;

export interface PerformanceReport {
timestamp: string;
  url: string;
  userAgent: string;
  webVitals: WebVitalsMetrics;
  customMetrics: CustomMetrics;
  slowResources: Array<{
    name: string;
    duration: number;
    type: string;
}>;
  errors: Array<{
    message: string;
    timestamp: number;
  }>;

class PerformanceMetricsService {
  private webVitals: WebVitalsMetrics = {};
  private errors: Array<{ message: string; timestamp: number }> = [];
  private reportingEndpoint?: string;

  constructor() {
    this.initializeWebVitals();
    this.setupErrorTracking();

  private initializeWebVitals() {
    // Measure Web Vitals using the Performance Observer API
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      this.observeMetric('paint', (entries) => {
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.webVitals.FCP = fcpEntry.startTime;
      });

      // Largest Contentful Paint
      this.observeMetric('largest-contentful-paint', (entries) => {
        const lcpEntry = entries[entries.length - 1];
        if (lcpEntry) {
          this.webVitals.LCP = lcpEntry.startTime;
      });

      // First Input Delay
      this.observeMetric('first-input', (entries) => {
        const fidEntry = entries[0];
        if (fidEntry) {
          this.webVitals.FID = fidEntry.processingStart - fidEntry.startTime;
      });

      // Cumulative Layout Shift
      this.observeMetric('layout-shift', (entries) => {
        let clsValue = 0;
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
        });
        this.webVitals.CLS = clsValue;
      });

      // Navigation timing for TTFB
      this.observeMetric('navigation', (entries) => {
        const navEntry = entries[0] as PerformanceNavigationTiming;
        if (navEntry) {
          this.webVitals.TTFB = navEntry.responseStart - navEntry.requestStart;
      });

  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ entryTypes: [type] });
    } catch (error) {
      console.warn(Failed to observe ${type} metrics:, error);

  private setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.errors.push({
        message: ${event.error?.name}: ${event.error?.message},
        timestamp: Date.now()
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.errors.push({
        message: Unhandled Promise Rejection: ${event.reason},
        timestamp: Date.now()
      });
    });

  public getWebVitals(): WebVitalsMetrics {
    return { ...this.webVitals };

  public getCustomMetrics(): CustomMetrics {
    const summary = performanceMonitor.getSummary();
    
    return {
      bundleLoadTime: summary.bundles.averageLoadTime || 0,
      componentLoadTime: summary.components.averageLoadTime || 0,
      imageLoadTime: summary.images.averageLoadTime || 0,
      apiResponseTime: this.calculateApiResponseTime(),
      routeChangeTime: this.calculateRouteChangeTime()
    };

  private calculateApiResponseTime(): number {
    const apiMetrics = performanceMonitor.getMetrics()
      .filter(metric => metric.metadata?.type === 'api' && metric.duration);
    
    if (apiMetrics.length === 0) return 0;
    
    const totalTime = apiMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    return totalTime / apiMetrics.length;

  private calculateRouteChangeTime(): number {
    const routeMetrics = performanceMonitor.getMetrics()
      .filter(metric => metric.metadata?.type === 'navigation' && metric.duration);
    
    if (routeMetrics.length === 0) return 0;
    
    const totalTime = routeMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    return totalTime / routeMetrics.length;

  public generateReport(): PerformanceReport {
    const slowResources = performanceMonitor.getSlowMetrics(500)
      .map(metric => ({
        name: metric.name,
        duration: metric.duration || 0,
        type: metric.metadata?.type || 'unknown'
      }));

    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      webVitals: this.getWebVitals(),
      customMetrics: this.getCustomMetrics(),
      slowResources,
      errors: [...this.errors]
    };

  public async sendReport(endpoint?: string): Promise<void> {
    const reportEndpoint = endpoint || this.reportingEndpoint;
    if (!reportEndpoint) {
      console.warn('No reporting endpoint configured for performance metrics');
      return;

    try {
      const report = this.generateReport();
      
      await fetch(reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });

      console.log('Performance report sent successfully');
    } catch (error) {
      console.error('Failed to send performance report:', error);

  public setReportingEndpoint(endpoint: string) {
    this.reportingEndpoint = endpoint;

  public getPerformanceScore(): number {
    const vitals = this.getWebVitals();
    const custom = this.getCustomMetrics();
    
    let score = 100;
    
    // Deduct points for poor Web Vitals
    if (vitals.FCP && vitals.FCP > 3000) score -= 20;
    if (vitals.LCP && vitals.LCP > 4000) score -= 25;
    if (vitals.FID && vitals.FID > 300) score -= 20;
    if (vitals.CLS && vitals.CLS > 0.25) score -= 15;
    if (vitals.TTFB && vitals.TTFB > 800) score -= 10;
    
    // Deduct points for slow custom metrics
    if (custom.bundleLoadTime > 1000) score -= 10;
    if (custom.componentLoadTime > 500) score -= 5;
    if (custom.imageLoadTime > 1000) score -= 5;
    if (custom.apiResponseTime > 1000) score -= 10;
    
    // Deduct points for errors
    const recentErrors = this.errors.filter(error => 
      Date.now() - error.timestamp < 300000 // Last 5 minutes
    );
    score -= Math.min(recentErrors.length * 5, 20);
    
    return Math.max(score, 0);

  public getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const score = this.getPerformanceScore();
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';

  public clearErrors() {
    this.errors = [];

  public getRecommendations(): string[] {
    const recommendations: string[] = [];
    const vitals = this.getWebVitals();
    const custom = this.getCustomMetrics();
    const slowResources = performanceMonitor.getSlowMetrics(1000);

    // Web Vitals recommendations
    if (vitals.FCP && vitals.FCP > 3000) {
      recommendations.push('Optimize First Contentful Paint by reducing server response time and eliminating render-blocking resources');
    
    if (vitals.LCP && vitals.LCP > 4000) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and critical resource loading');
    
    if (vitals.FID && vitals.FID > 300) {
      recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time and using web workers');
    
    if (vitals.CLS && vitals.CLS > 0.25) {
      recommendations.push('Minimize Cumulative Layout Shift by setting dimensions for images and avoiding dynamic content insertion');

    // Custom metrics recommendations
    if (custom.bundleLoadTime > 1000) {
      recommendations.push('Optimize bundle loading with code splitting and lazy loading');
    
    if (custom.componentLoadTime > 500) {
      recommendations.push('Optimize component rendering with React.memo and useMemo');
    
    if (custom.imageLoadTime > 1000) {
      recommendations.push('Optimize images with WebP format, compression, and responsive sizing');
    
    if (custom.apiResponseTime > 1000) {
      recommendations.push('Optimize API performance with caching, pagination, and request optimization');

    // Slow resources recommendations
    if (slowResources.length > 0) {
      recommendations.push(Address ${slowResources.length} slow-loading resources identified in the performance dashboard);

    return recommendations;

// Global instance
export const performanceMetrics = new PerformanceMetricsService();

// Utility functions
export const trackPageView = (pageName: string) => {
  performanceMonitor.startTiming(page_view_${pageName}, {
    type: 'page_view',
    page: pageName
  });
};

export const trackUserInteraction = (action: string, element: string) => {
  performanceMonitor.startTiming(interaction_${action}_${element}, {
    type: 'user_interaction',
    action,
    element
  });
  
  // End timing after a short delay
  setTimeout(() => {
    performanceMonitor.endTiming(interaction_${action}_${element}, {
      type: 'user_interaction',
      action,
      element,
      success: true
    });
  }, 50);
};

export const trackFormSubmission = async <T>(;
  formName: string,;
  submitFunction: () => Promise<T>;
): Promise<T> => {
  const operationName = form_submit_${formName};
  
  performanceMonitor.startTiming(operationName, {
    type: 'form_submission',
    form: formName
  });

  try {
    const result = await submitFunction();
    performanceMonitor.endTiming(operationName, {
      type: 'form_submission',
      form: formName,
      success: true
    });
    return result;
  } catch (error) {
    performanceMonitor.endTiming(operationName, {
      type: 'form_submission',
      form: formName,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
};

export default performanceMetrics;
}
}