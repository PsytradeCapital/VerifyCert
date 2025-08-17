import { performanceMonitor, logPerformanceStats } from './performanceMonitoring';
import { performanceMetrics } from '../services/performanceMetrics';

/**
 * Initialize comprehensive performance monitoring
 */
export const initializePerformanceMonitoring = () => {
  // Set up automatic performance reporting
  setupAutomaticReporting();
  
  // Set up performance alerts
  setupPerformanceAlerts();
  
  // Set up memory monitoring
  setupMemoryMonitoring();
  
  // Set up user interaction monitoring
  setupUserInteractionMonitoring();
  
  // Set up error monitoring integration
  setupErrorMonitoring();
  
  // Set up page visibility monitoring
  setupPageVisibilityMonitoring();
  
  console.log('🚀 Performance monitoring initialized');
};

/**
 * Set up automatic performance reporting
 */
function setupAutomaticReporting() {
  // Send performance report every 5 minutes in production
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_PERFORMANCE_ENDPOINT) {
    setInterval(() => {
      performanceMetrics.sendReport().catch(error => {
        console.warn('Failed to send performance report:', error);
      });
    }, 5 * 60 * 1000); // 5 minutes
  
  // Send report on page unload
  window.addEventListener('beforeunload', () => {
    try {
      const report = performanceMetrics.generateReport();
      
      // Use sendBeacon for reliable delivery
      if (navigator.sendBeacon && process.env.REACT_APP_PERFORMANCE_ENDPOINT) {
        navigator.sendBeacon(
          process.env.REACT_APP_PERFORMANCE_ENDPOINT,
          JSON.stringify(report)
        );
    } catch (error) {
      console.warn('Failed to send final performance report:', error);
  });

/**
 * Set up performance alerts for critical issues
 */
function setupPerformanceAlerts() {
  let lastAlertTime = 0;
  const alertCooldown = 30000; // 30 seconds
  
  setInterval(() => {
    const now = Date.now();
    if (now - lastAlertTime < alertCooldown) return;
    
    const slowMetrics = performanceMonitor.getSlowMetrics(2000); // 2 second threshold
    const criticalMetrics = slowMetrics.filter(metric => 
      metric.duration && metric.duration > 5000 // 5 second threshold
    );
    
    if (criticalMetrics.length > 0) {
      lastAlertTime = now;
      
      console.error('🚨 Critical performance issues detected:', criticalMetrics);
      
      // In development, show more detailed information
      if (process.env.NODE_ENV === 'development') {
        console.group('🔍 Performance Analysis');
        console.table(criticalMetrics);
        console.log('Recommendations:', performanceMetrics.getRecommendations());
        console.groupEnd();
  }, 10000); // Check every 10 seconds

/**
 * Set up memory monitoring
 */
function setupMemoryMonitoring() {
  if (!('memory' in performance)) return;
  
  const memoryMonitor = () => {
    const memory = (performance as any).memory;
    if (!memory) return;
    
    const memoryInfo = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
    
    // Log memory usage
    performanceMonitor.startTiming('memory_usage');
    performanceMonitor.endTiming('memory_usage', {
      type: 'memory',
      ...memoryInfo
    });
    
    // Alert on high memory usage
    if (memoryInfo.usagePercentage > 80) {
      console.warn('⚠️ High memory usage detected:', memoryInfo);
  };
  
  // Monitor memory every 30 seconds
  setInterval(memoryMonitor, 30000);
  
  // Initial memory check
  memoryMonitor();

/**
 * Set up user interaction monitoring
 */
function setupUserInteractionMonitoring() {
  // Track click interactions
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const className = target.className;
    const id = target.id;
    
    const identifier = id || className || tagName;
    
    performanceMonitor.startTiming(`interaction_click_${identifier}`, {
      type: 'user_interaction',
      action: 'click',
      element: tagName,
      identifier
    });
    
    // End timing after a short delay to capture any immediate effects
    setTimeout(() => {
      performanceMonitor.endTiming(`interaction_click_${identifier}`, {
        type: 'user_interaction',
        action: 'click',
        element: tagName,
        identifier,
        success: true
      });
    }, 100);
  });
  
  // Track form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    const formId = form.id || form.className || 'unknown_form';
    
    performanceMonitor.startTiming(`form_submit_${formId}`, {
      type: 'form_interaction',
      action: 'submit',
      formId
    });
  });
  
  // Track input focus (for form performance)
  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') {
      const inputType = (target as HTMLInputElement).type || 'text';
      
      performanceMonitor.startTiming(`input_focus_${inputType}`, {
        type: 'input_interaction',
        action: 'focus',
        inputType
      });
      
      setTimeout(() => {
        performanceMonitor.endTiming(`input_focus_${inputType}`, {
          type: 'input_interaction',
          action: 'focus',
          inputType,
          success: true
        });
      }, 50);
  });

/**
 * Set up error monitoring integration
 */
function setupErrorMonitoring() {
  // Track JavaScript errors with performance context
  window.addEventListener('error', (event) => {
    const performanceSummary = performanceMonitor.getSummary();
    const recentSlowMetrics = performanceMonitor.getSlowMetrics(1000);
    
    console.error('💥 JavaScript error with performance context:', {
      error: event.error,
      performanceSummary,
      recentSlowMetrics: recentSlowMetrics.slice(0, 5) // Last 5 slow metrics
    });
  });
  
  // Track unhandled promise rejections with performance context
  window.addEventListener('unhandledrejection', (event) => {
    const performanceSummary = performanceMonitor.getSummary();
    
    console.error('💥 Unhandled promise rejection with performance context:', {
      reason: event.reason,
      performanceSummary
    });
  });

/**
 * Set up page visibility monitoring
 */
function setupPageVisibilityMonitoring() {
  let pageHiddenTime: number | null = null;
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pageHiddenTime = performance.now();
      performanceMonitor.startTiming('page_hidden', {
        type: 'page_visibility',
        action: 'hidden'
      });
    } else {
      if (pageHiddenTime !== null) {
        performanceMonitor.endTiming('page_hidden', {
          type: 'page_visibility',
          action: 'visible',
          hiddenDuration: performance.now() - pageHiddenTime
        });
        pageHiddenTime = null;
      
      // Log performance stats when page becomes visible again
      if (process.env.NODE_ENV === 'development') {
        setTimeout(logPerformanceStats, 1000);
  });

/**
 * Get current performance health status
 */
export const getPerformanceHealth = () => {
  const score = performanceMetrics.getPerformanceScore();
  const grade = performanceMetrics.getPerformanceGrade();
  const slowMetrics = performanceMonitor.getSlowMetrics(1000);
  const summary = performanceMonitor.getSummary();
  
  return {
    score,
    grade,
    status: score >= 80 ? 'good' : score >= 60 ? 'warning' : 'poor',
    slowMetricsCount: slowMetrics.length,
    totalMetrics: summary.total,
    recommendations: performanceMetrics.getRecommendations()
  };
};

/**
 * Export performance data for debugging
 */
export const exportPerformanceData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    health: getPerformanceHealth(),
    metrics: performanceMonitor.getMetrics(),
    summary: performanceMonitor.getSummary(),
    webVitals: performanceMetrics.getWebVitals(),
    customMetrics: performanceMetrics.getCustomMetrics(),
    report: performanceMetrics.generateReport()
  };
  
  return JSON.stringify(data, null, 2);
};

/**
 * Clear all performance data
 */
export const clearPerformanceData = () => {
  performanceMonitor.clear();
  performanceMetrics.clearErrors();
  console.log('🧹 Performance data cleared');
};

// Make functions available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).performanceDebug = {
    getHealth: getPerformanceHealth,
    exportData: exportPerformanceData,
    clearData: clearPerformanceData,
    logStats: logPerformanceStats,
    monitor: performanceMonitor,
    metrics: performanceMetrics
  };
  
  console.log('🔧 Performance debugging tools available at window.performanceDebug');

export default initializePerformanceMonitoring;