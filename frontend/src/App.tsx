import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import { Navigation } from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import VerificationPage from './pages/VerificationPage';
import IssuerDashboard from './pages/IssuerDashboard';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OTPVerificationPage from './pages/auth/OTPVerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

// Styles
import './index.css';

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletConnect = (address: string, provider: any) => {
    setWalletAddress(address);
    setIsWalletConnected(true);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navigation 
                walletAddress={walletAddress}
                isWalletConnected={isWalletConnected}
                onWalletConnect={handleWalletConnect}
                onWalletDisconnect={handleWalletDisconnect}
              />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/verify" element={<VerificationPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/verify-otp" element={<OTPVerificationPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute isWalletConnected={isWalletConnected}>
                      <IssuerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute isWalletConnected={isWalletConnected}>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;