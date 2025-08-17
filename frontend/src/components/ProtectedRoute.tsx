import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  isWalletConnected: boolean;
  requireWallet?: boolean;
  allowDemoMode?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  isWalletConnected, 
  requireWallet = true,
  allowDemoMode = false
}: ProtectedRouteProps) {
  const location = useLocation();

  // If wallet is required but not connected, redirect to home with state
  // Exception: if demo mode is allowed, we still redirect but with a different message
  if (requireWallet && !isWalletConnected) {
    const message = allowDemoMode 
      ? 'Connect your wallet to access the dashboard and explore all features!'
      : 'Please connect your wallet to access this page.';
      
    return (
      <Navigate 
        to="/" 
        state={{ 
          from: location,
          message,
          showDemoPrompt: allowDemoMode
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
}