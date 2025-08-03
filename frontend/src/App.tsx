import React, { useState, useCallback, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Context
import { NavigationProvider } from './contexts/NavigationContext';
import { FeedbackProvider } from './components/ui/Feedback';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import BlockchainErrorBoundary from './components/BlockchainErrorBoundary';
import { PageTransition } from './components/ui';
import { OfflineIndicator, ServiceWorkerUpdate, PWAInstallPrompt, IOSInstallInstructions } from './components/ui/OfflineIndicator';
import PushNotificationSettings from './components/ui/PushNotificationSettings';

// Lazy Components
import {
  LazyIssuerDashboard,
  LazyCertificateViewer,
  LazyVerificationPage,
  LazyLayoutDemo,
  LazyBreadcrumbsDemo,
  LazyNavigationDemo,
  LazyNavigationStateDemo,
  LazyPageTransitionDemo,
  LazyFeedbackAnimationsDemo,
  LazyPWATestPage,
  LazyThemeDemo,
  LazyPushNotificationDemo,
  ComponentLoading,
  ComponentLoadError
} from './components/lazy';

import { LazyComponentWrapper } from './utils/lazyLoading';

// Hooks
import useServiceWorker, { usePWAInstallation } from './hooks/useServiceWorker';

// Services
import { errorLogger } from './services/errorLogger';

// Pages (keep lightweight pages as regular imports)
import Home from './pages/Home';
import Verify from './pages/Verify';
import NotFound from './pages/NotFound';

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
    installationState,
    isMobile,
    isIOSSafari,
    showIOSInstructions 
  } = usePWAInstallation();

  // State for iOS install instructions
  const [showIOSModal, setShowIOSModal] = React.useState(false);

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

          {/* Main Content */}
          <main>
            <RouteErrorBoundary onError={handleGlobalError}>
              <Routes>
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

                {/* Protected Routes - Require Wallet Connection */}
                <Route 
                  path="/dashboard" 
                  element={
                    <BlockchainErrorBoundary onError={handleGlobalError}>
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
                    </BlockchainErrorBoundary>
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
            </div>
          </NavigationProvider>
        </Router>
      </FeedbackProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;