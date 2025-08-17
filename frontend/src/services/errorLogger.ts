import { ErrorInfo } from 'react';

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  walletAddress?: string;
  errorType: 'javascript' | 'react' | 'blockchain' | 'network' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorReport[] = [];
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        undefined,
        'javascript',
        'high',
        { reason: event.reason
      );
    });

    // Listen for global JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(
        new Error(event.message),
        undefined,
        'javascript',
        'medium',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
      );
    });

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    return ErrorLogger.instance;

  public logError(
    error: Error,
    errorInfo?: ErrorInfo,
    errorType: ErrorReport['errorType'] = 'javascript',
    severity: ErrorReport['severity'] = 'medium',
    context?: Record<string, any>
  ): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorType,
      severity,
      context: {
        ...context,
        // Add wallet context if available
        walletConnected: this.getWalletContext(),
        // Add performance context
        memory: this.getMemoryUsage(),
        // Add network context
        connectionType: this.getConnectionType(),
      },
    };

    // Add to queue
    this.errorQueue.push(errorReport);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Report [${severity.toUpperCase()}]`);
      console.error('Error:', error);
      console.log('Error Report:', errorReport);
      if (errorInfo) {
        console.log('Component Stack:', errorInfo.componentStack);
      console.groupEnd();

    // Send to external service if online
    if (this.isOnline) {
      this.sendErrorReport(errorReport);

  public logBlockchainError(
    error: Error,
    operation: string,
    contractAddress?: string,
    transactionHash?: string,
    walletAddress?: string
  ): void {
    this.logError(
      error,
      undefined,
      'blockchain',
      'high',
      {
        operation,
        contractAddress,
        transactionHash,
        walletAddress,
        network: this.getNetworkInfo(),
    );

  public logNetworkError(
    error: Error,
    endpoint: string,
    method: string,
    statusCode?: number
  ): void {
    this.logError(
      error,
      undefined,
      'network',
      'medium',
      {
        endpoint,
        method,
        statusCode,
        networkStatus: navigator.onLine ? 'online' : 'offline',
    );

  public logValidationError(
    error: Error,
    formData: Record<string, any>,
    fieldName?: string
  ): void {
    this.logError(
      error,
      undefined,
      'validation',
      'low',
      {
        formData: this.sanitizeFormData(formData),
        fieldName,
    );

  private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
    try {
      // In a real application, you would send this to your error reporting service
      // Examples: Sentry, LogRocket, Bugsnag, or your own API
      
      // For now, we'll simulate sending to a logging endpoint
      if (process.env.REACT_APP_ERROR_REPORTING_URL) {
        await fetch(process.env.REACT_APP_ERROR_REPORTING_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport),
        });

      // Remove from queue after successful send
      const index = this.errorQueue.indexOf(errorReport);
      if (index > -1) {
        this.errorQueue.splice(index, 1);
    } catch (sendError) {
      console.error('Failed to send error report:', sendError);
      // Keep in queue for retry when back online

  private flushErrorQueue(): void {
    const queueCopy = [...this.errorQueue];
    queueCopy.forEach(errorReport => {
      this.sendErrorReport(errorReport);
    });

  private getWalletContext(): any {
    try {
      // Try to get wallet info from window.ethereum
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        return {
          isMetaMaskInstalled: !!(window as any).ethereum.isMetaMask,
          chainId: (window as any).ethereum.chainId,
          networkVersion: (window as any).ethereum.networkVersion,
        };
    } catch (error) {
      // Ignore errors when getting wallet context
    return null;

  private getMemoryUsage(): any {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
    } catch (error) {
      // Ignore errors when getting memory usage
    return null;

  private getConnectionType(): string {
    try {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        return connection.effectiveType || connection.type || 'unknown';
    } catch (error) {
      // Ignore errors when getting connection type
    return 'unknown';

  private getNetworkInfo(): any {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        return {
          chainId: (window as any).ethereum.chainId,
          networkVersion: (window as any).ethereum.networkVersion,
        };
    } catch (error) {
      // Ignore errors when getting network info
    return null;

  private sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized = { ...formData };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'privateKey', 'mnemonic', 'seed'];
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
    });

    return sanitized;

  public getErrorStats(): { total: number; byType: Record<string, number>; bySeverity: Record<string, number> {
    const stats = {
      total: this.errorQueue.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    };

    this.errorQueue.forEach(error => {
      stats.byType[error.errorType] = (stats.byType[error.errorType] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Export convenience functions
export const logError = (error: Error, errorInfo?: ErrorInfo, context?: Record<string, any>) => {
  errorLogger.logError(error, errorInfo, 'javascript', 'medium', context);
};

export const logBlockchainError = (
  error: Error,
  operation: string,
  contractAddress?: string,
  transactionHash?: string,
  walletAddress?: string
) => {
  errorLogger.logBlockchainError(error, operation, contractAddress, transactionHash, walletAddress);
};

export const logNetworkError = (error: Error, endpoint: string, method: string, statusCode?: number) => {
  errorLogger.logNetworkError(error, endpoint, method, statusCode);
};

export const logValidationError = (error: Error, formData: Record<string, any>, fieldName?: string) => {
  errorLogger.logValidationError(error, formData, fieldName);
};