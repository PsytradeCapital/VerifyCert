export interface PerformanceConfig {
  enableMetrics: boolean;
  enableTiming: boolean;
  enableUserTiming: boolean;
}

export class PerformanceSetup {
  private config: PerformanceConfig;
  
  constructor(config: PerformanceConfig) {
    this.config = config;
  }
  
  initializePerformanceMonitoring() {
    if (!this.config.enableMetrics) return;
    
    this.setupNavigationTiming();
    this.setupUserInteractionTiming();
  }
  
  private setupNavigationTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        console.log('Page loaded');
      });
    }
  }
  
  private setupUserInteractionTiming() {
    if (typeof window !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const identifier = target.id || target.className || 'unknown';
        console.log('Click interaction on:', identifier);
      });
    }
  }
}

export const createPerformanceSetup = (config: PerformanceConfig) => {
  return new PerformanceSetup(config);
};

export const defaultPerformanceConfig: PerformanceConfig = {
  enableMetrics: true,
  enableTiming: true,
  enableUserTiming: true
};
