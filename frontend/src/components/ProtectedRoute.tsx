import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  isWalletConnected: boolean;
  requireWallet?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  isWalletConnected, 
  requireWallet = true 
}: ProtectedRouteProps) {
  const location = useLocation();

  // If wallet is required but not connected, redirect to home with state
  if (requireWallet && !isWalletConnected) {
    return (
      <Navigate 
        to="/" 
        state={{ 
          from: location,
          message: 'Please connect your wallet to access this page.' 
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
}