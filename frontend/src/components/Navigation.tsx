import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/ThemeProvider';

interface NavigationProps {
walletAddress?: string | null;
  isWalletConnected?: boolean;
  onWalletConnect?: (address: string, provider: any) => void;
  onWalletDisconnect?: () => void;
}}

export const Navigation: React.FC<NavigationProps> = ({
  walletAddress,
  isWalletConnected,
  onWalletConnect,
  onWalletDisconnect
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleWalletConnect = () => {
    if (onWalletConnect) {
      onWalletConnect('0x1234...5678', null);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 rounded-lg p-2">
                <span className="text-white font-bold">🛡️</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">VerifyCert</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                🏠 Home
              </Link>
              
              <Link
                to="/verify"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/verify') 
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                🔍 Verify
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  📊 Dashboard
                </Link>
              )}
            </div>

            <button
              onClick={handleWalletConnect}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {isWalletConnected ? `Connected: ${walletAddress?.slice(0, 6)}...` : 'Connect Wallet'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  👤 {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
}