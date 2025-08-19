import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { 
  Shield, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Search, 
  Plus,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import WalletConnect from './WalletConnect';

interface NavigationProps {
  walletAddress?: string | null;
  isWalletConnected?: boolean;
  onWalletConnect?: (address: string, provider: any) => void;
  onWalletDisconnect?: () => void;

export const Navigation: React.FC<NavigationProps> = ({
  walletAddress,
  isWalletConnected,
  onWalletConnect,
  onWalletDisconnect
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/verify', label: 'Verify', icon: Search },
  ];

  const authenticatedLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Settings },
    { path: '/issue', label: 'Issue Certificate', icon: Plus },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 rounded-lg p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VerifyCert</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main navigation links */}
            <div className="flex items-center space-x-6">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}

              {/* Authenticated user links */}
              {isAuthenticated && (
                <>
                  {authenticatedLinks.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(path)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Wallet Connect */}
            <div className="flex items-center">
              <WalletConnect
                onConnect={onWalletConnect}
                onDisconnect={onWalletDisconnect}
                className="mr-4"
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-blue-600" />
              )}
            </button>

            {/* User menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    <div className="text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    title="Profile Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Main navigation links */}
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}

              {/* Authenticated user links */}
              {isAuthenticated && (
                <>
                  {authenticatedLinks.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(path)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                  
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Profile Settings</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {/* Authentication links for non-authenticated users */}
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors mt-2"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* User info in mobile menu */}
            {isAuthenticated && user && (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-5">
                  <div className="bg-gray-100 rounded-full p-2">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                    {user.email && (
                      <div className="text-sm text-gray-500">{user.email}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};