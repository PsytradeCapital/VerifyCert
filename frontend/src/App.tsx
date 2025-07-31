import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Context
import { NavigationProvider } from './contexts/NavigationContext';
import { FeedbackProvider } from './components/ui/Feedback';

// Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import BlockchainErrorBoundary from './components/BlockchainErrorBoundary';
import { PageTransition } from './components/ui';

// Services
import { errorLogger } from './services/errorLogger';

// Pages
import Home from './pages/Home';
import IssuerDashboard from './pages/IssuerDashboard';
import CertificateViewer from './pages/CertificateViewer';
import VerificationPage from './pages/VerificationPage';
import Verify from './pages/Verify';
import LayoutDemo from './pages/LayoutDemo';
import BreadcrumbsDemo from './pages/BreadcrumbsDemo';
import NavigationDemo from './pages/NavigationDemo';
import NavigationStateDemo from './pages/NavigationStateDemo';
import PageTransitionDemo from './pages/PageTransitionDemo';
import FeedbackAnimationsDemo from './components/FeedbackAnimationsDemo';
import NotFound from './pages/NotFound';

import './App.css';

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
      <FeedbackProvider>
        <Router>
          <NavigationProvider isWalletConnected={walletState.isConnected}>
            <div className="App min-h-screen bg-gray-50">
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
                      <VerificationPage />
                    </BlockchainErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/layout-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <LayoutDemo />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/breadcrumbs-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <BreadcrumbsDemo />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/navigation-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <NavigationDemo />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/navigation-state-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <NavigationStateDemo />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/feedback-animations-demo" 
                  element={
                    <ErrorBoundary onError={handleGlobalError}>
                      <FeedbackAnimationsDemo />
                    </ErrorBoundary>
                  } 
                />
                
                <Route 
                  path="/certificate/:tokenId" 
                  element={
                    <BlockchainErrorBoundary onError={handleGlobalError}>
                      <CertificateViewer />
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
                        <IssuerDashboard />
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
            </div>
          </NavigationProvider>
        </Router>
      </FeedbackProvider>
    </ErrorBoundary>
  );
}

export default App;