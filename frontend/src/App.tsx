import React, { useState, useCallback, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Bundle optimization
import { initializeOptimization } from './utils/webpackOptimization';
import { monitorBundleSize } from './utils/bundleOptimization';

// Performance monitoring
import { initializePerformanceMonitoring } from './utils/performanceSetup';
import './utils/monitoredFetch'; // Initialize monitored fetch

// Context
import { NavigationProvider } from './contexts/NavigationContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { ProtectedRoute as AuthProtectedRoute } from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import BlockchainErrorBoundary from './components/BlockchainErrorBoundary';
import { PageTransition } from './components/ui';
import { OfflineIndicator, ServiceWorkerUpdate, PWAInstallPrompt, IOSInstallInstructions } from './components/ui/OfflineIndicator';
import PushNotificationSettings from './components/ui/PushNotificationSettings';
import { FeedbackIntegration } from './components/ui/Feedback';

// Lazy Components
import {
  LazyIssuerDashboard,
  LazyCertificateViewer,
  LazyVerificationPage,
  LazyLayoutDemo,
  LazyBreadcrumbsDemo,
  LazyNavigationDemo,
  LazyNavigationStateDemo,
  LazyFeedbackAnimationsDemo,
  LazyPWATestPage,
  LazyThemeDemo,
  LazyPushNotificationDemo,
  LazyFeedbackDashboard,
  LazyFeedbackDemo,
  LazyPerformanceDashboard,
  ComponentLoading,
  ComponentLoadError
} from './components/lazy';

import { LazyComponentWrapper } from './utils/lazyLoading';

// Hooks
import useServiceWorker, { usePWAInstallation } from './hooks/useServiceWorker';
import { useImageOptimization } from './hooks/useImageOptimization';

// Services
import { errorLogger } from './services/errorLogger';
import { performanceMetrics } from './services/performanceMetrics';

// Performance monitoring components
import { PerformanceAlert, PerformanceIndicator } from './components/ui/Performance/PerformanceAlert';
import RouteTracker from './components/RouteTracker';

// Pages (keep lightweight pages as regular imports)
import Home from './pages/Home';
import Verify from './pages/Verify';
import NotFound from './pages/NotFound';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OTPVerificationPage } from './pages/auth/OTPVerificationPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';

import './App.css';
import './styles/themes.css';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
}

function App() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
  });

  // Service Worker and PWA hooks
  const [swState, swActions] = useServiceWorker();
  const { 
    canInstall, 
    isInstalled, 
    installPWA, 
    isIOSSafari,
    showIOSInstructions 
  } = usePWAInstallation();

  // Image optimization hook - commented out unused variables
  // const { isInitialized: imageOptInitialized, webpSupported } = useImageOptimization();

  // State for iOS install instructions
  const [showIOSModal, setShowIOSModal] = React.useState(false);
  
  // State for performance dashboard
  const [showPerformanceDashboard, setShowPerformanceDashboard] = React.useState(false);

  // Initialize bundle optimization monitoring
  React.useEffect(() => {
    initializeOptimization();
    monitorBundleSize();
    
    // Initialize comprehensive performance monitoring
    initializePerformanceMonitoring();
    
    // Initialize performance metrics reporting
    if (process.env.REACT_APP_PERFORMANCE_ENDPOINT) {
      performanceMetrics.setReportingEndpoint(process.env.REACT_APP_PERFORMANCE_ENDPOINT);
    }
  }, []);

  // Show iOS instructions when appropriate
  React.useEffect(() => {
    if (showIOSInstructions && !showIOSModal) {
      // Delay showing iOS instructions to avoid overwhelming the user
      const timer = setTimeout(() => {
        setShowIOSModal(true);
      }, 5000); // 5 second delay

      return () => clearTimeout(timer);
    }
  }, [showIOSInstructions, showIOSModal]);

  // Handle wallet connection
  const handleWalletConnect = useCallback((address: string, provider: ethers.BrowserProvider) => {
    setWalletState({
      isConnected: true,
      address,
      provider,
    });
    toast.success('Wallet connected successfully!');
  }, []);

  // Handle wallet disconnection
  const handleWalletDisconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      provider: null,
    });
    toast.success('Wallet disconnected');
  }, []);

  // Global error handler for error boundary
  const handleGlobalError = (error: Error, errorInfo: any) => {
    errorLogger.logError(error, errorInfo, 'react', 'high', {
      walletConnected: walletState.isConnected,
      walletAddress: walletState.address,
    });
  };

  return (
    <ErrorBoundary onError={handleGlobalError}>
      <ThemeProvider>
        <AuthProvider>
          <FeedbackProvider>
            <Router>
              <NavigationProvider isWalletConnected={walletState.isConnected}>
            <div className="App min-h-screen bg-background text-foreground transition-colors duration-200">
          {/* Navigation */}
          <BlockchainErrorBoundary onError={handleGlobalError}>
            <Navigation
              walletAddress={walletState.address}
              isWalletConnected={walletState.isConnected}
              onWalletConnect={handleWalletConnect}
              onWalletDisconnect={handleWalletDisconnect}
            />
          </BlockchainErrorBoundary>

          {/* Route Performance Tracking */}
          <RouteTracker />

          {/* Main Content */}
          <main>
            <RouteErrorBoundary onError={handleGlobalError}>
              <Routes>
                {/* Authentication Routes */}
                <Route 
                  path="/login" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LoginPage />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/register" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <SignupPage />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/verify-otp" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <OTPVerificationPage />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/forgot-password" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <ForgotPasswordPage />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/reset-password" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <ResetPasswordPage />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/unauthorized" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <UnauthorizedPage />
                    </ErrorBoundary>
                  } 
                />

                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <Home 
                        isWalletConnected={walletState.isConnected}
                        walletAddress={walletState.address}
                      />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/verify" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <Verify />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/verify/:tokenId" 
                  element={
                    <BlockchainErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyVerificationPage />
                      </LazyComponentWrapper>
                    </BlockchainErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/layout-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyLayoutDemo />
                      </LazyComponentWrapper>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/breadcrumbs-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyBreadcrumbsDemo />
                      </LazyComponentWrapper>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/navigation-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyNavigationDemo />
                      </LazyComponentWrapper>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/navigation-state-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyNavigationStateDemo />
                      </LazyComponentWrapper>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/feedback-animations-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyFeedbackAnimationsDemo />
                      </LazyComponentWrapper>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/notifications" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <div className="container mx-auto px-4 py-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Push Notification Settings</h1>
                        <Suspense fallback={<ComponentLoading />}>
                          <PushNotificationSettings userId={walletState.address || 'demo-user'} />
                        </Suspense>
                      </div>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/push-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyPushNotificationDemo />
                      </LazyComponentWrapper>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/pwa-test" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyPWATestPage />
                      </LazyComponentWrapper>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/theme-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyThemeDemo />
                      </LazyComponentWrapper>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/feedback-dashboard" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <Suspense fallback={<ComponentLoading />}>
                        <LazyFeedbackDashboard />
                      </Suspense>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/feedback-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <Suspense fallback={<ComponentLoading />}>
                        <LazyFeedbackDemo />
                      </Suspense>
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/certificate/:tokenId" 
                  element={
                    <BlockchainErrorBoundary onError={handleGlobalError}>
                      <LazyComponentWrapper 
                        fallback={<ComponentLoading />}
                        errorFallback={ComponentLoadError}
                      >
                        <LazyCertificateViewer />
                      </LazyComponentWrapper>
                    </BlockchainErrorBoundary>
                  } 
                />

                {/* Protected Routes - Require Authentication and Wallet Connection */}
                <Route 
                  path="/dashboard" 
                  element={
                    <BlockchainErrorBoundary onError={handleGlobalError}>
                      <AuthProtectedRoute requireAuth={true} requireVerification={true}>
                        <ProtectedRoute 
                          isWalletConnected={walletState.isConnected}
                          requireWallet={true}
                        >
                          <LazyComponentWrapper 
                            fallback={<ComponentLoading />}
                            errorFallback={ComponentLoadError}
                          >
                            <LazyIssuerDashboard />
                          </LazyComponentWrapper>
                        </ProtectedRoute>
                      </AuthProtectedRoute>
                    </BlockchainErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/issue" 
                  element={
                    <BlockchainErrorBoundary onError={handleGlobalError}>
                      <AuthProtectedRoute 
                        requireAuth={true} 
                        requireVerification={true}
                        allowedRoles={['issuer', 'admin']}
                      >
                        <ProtectedRoute 
                          isWalletConnected={walletState.isConnected}
                          requireWallet={true}
                        >
                          <LazyComponentWrapper 
                            fallback={<ComponentLoading />}
                            errorFallback={ComponentLoadError}
                          >
                            <LazyIssuerDashboard />
                          </LazyComponentWrapper>
                        </ProtectedRoute>
                      </AuthProtectedRoute>
                    </BlockchainErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <AuthProtectedRoute requireAuth={true} requireVerification={true}>
                        <LazyComponentWrapper 
                          fallback={<ComponentLoading />}
                          errorFallback={ComponentLoadError}
                        >
                          <div className="container mx-auto px-4 py-8">
                            <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
                            <p>Profile management coming soon...</p>
                          </div>
                        </LazyComponentWrapper>
                      </AuthProtectedRoute>
                    </ErrorBoundary>
                  } 
                />

                {/* 404 Not Found */}
                <Route 
                  path="*" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <NotFound />
                    </ErrorBoundary>
                  } 
                />
              </Routes>
            </RouteErrorBoundary>
          </main>

          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* PWA and Offline Components */}
          <OfflineIndicator />
          <ServiceWorkerUpdate 
            hasUpdate={swState.hasUpdate}
            onUpdate={swActions.update}
          />
          <PWAInstallPrompt 
            canInstall={canInstall && !isInstalled && !isIOSSafari}
            onInstall={installPWA}
          />
          <IOSInstallInstructions
            isVisible={showIOSModal && showIOSInstructions}
            onDismiss={() => setShowIOSModal(false)}
          />

          {/* Performance Monitoring Components */}
          <PerformanceAlert 
            threshold={1000}
            position="top-right"
            showInProduction={false}
          />
          <PerformanceIndicator 
            onClick={() => setShowPerformanceDashboard(true)}
          />

          {/* Performance Dashboard Modal */}
          {showPerformanceDashboard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold">Performance Dashboard</h2>
                  <button
                    onClick={() => setShowPerformanceDashboard(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <Suspense fallback={<div className="p-8 text-center">Loading performance dashboard...</div>}>
                    <LazyComponentWrapper 
                      fallback={<ComponentLoading />}
                      errorFallback={ComponentLoadError}
                    >
                      <LazyPerformanceDashboard />
                    </LazyComponentWrapper>
                  </Suspense>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Integration */}
          <FeedbackIntegration
            showFloatingButton={true}
            showAutoTrigger={true}
            triggerAfterTime={30000}
            triggerAfterScroll={80}
            buttonPosition="bottom-right"
            onFeedbackSubmitted={(feedback) => {
              console.log('Feedback submitted:', feedback);
              // Track feedback submission in analytics
              if (window.gtag) {
                window.gtag('event', 'feedback_submitted', {
                  category: feedback.category,
                  rating: feedback.rating,
                  page: feedback.page
                });
              }
            }}
          />
            </div>
          </NavigationProvider>
        </Router>
      </FeedbackProvider>
    </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;