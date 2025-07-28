import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';

export interface UserMenuProps {
  walletAddress?: string | null;
  isWalletConnected?: boolean;
  onWalletConnect?: () => void;
  onWalletDisconnect?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  notifications?: number;
}

export interface HeaderProps {
  title?: string;
  showSidebarToggle?: boolean;
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  onSidebarToggle?: () => void;
  onMobileMenuToggle?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  userMenu?: UserMenuProps;
  className?: string;
  children?: React.ReactNode;
}

const UserMenu: React.FC<UserMenuProps> = ({
  walletAddress,
  isWalletConnected = false,
  onWalletConnect,
  onWalletDisconnect,
  onProfileClick,
  onSettingsClick,
  notifications = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isWalletConnected || !walletAddress) {
    return (
      <button
        onClick={onWalletConnect}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium text-sm"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary-700 text-sm font-medium">
            {walletAddress.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:block text-sm text-neutral-700 max-w-24 truncate">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
        {notifications > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-error-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {notifications > 9 ? '9+' : notifications}
            </span>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-dropdown">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-sm font-medium text-neutral-900">Connected Wallet</p>
            <p className="text-xs text-neutral-500 font-mono">
              {walletAddress}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                onProfileClick?.();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <User className="h-4 w-4 mr-3" />
              Profile
            </button>
            
            <button
              onClick={() => {
                onSettingsClick?.();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </button>

            {notifications > 0 && (
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Bell className="h-4 w-4 mr-3" />
                Notifications
                <span className="ml-auto bg-error-100 text-error-700 text-xs px-2 py-0.5 rounded-full">
                  {notifications}
                </span>
              </button>
            )}
          </div>

          {/* Disconnect */}
          <div className="border-t border-neutral-100 py-1">
            <button
              onClick={() => {
                onWalletDisconnect?.();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({
  title = 'VerifyCert',
  showSidebarToggle = true,
  sidebarCollapsed = false,
  isMobile = false,
  mobileMenuOpen = false,
  onSidebarToggle,
  onMobileMenuToggle,
  showSearch = false,
  onSearchClick,
  userMenu,
  className = '',
  children
}) => {
  return (
    <header className={`sticky top-0 z-sticky bg-white border-b border-neutral-200 shadow-sm ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo, menu toggle, and branding */}
          <div className="flex items-center">
            {/* Mobile menu toggle */}
            {showSidebarToggle && isMobile && (
              <button
                onClick={onMobileMenuToggle}
                className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mr-3"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}

            {/* Desktop sidebar toggle */}
            {showSidebarToggle && !isMobile && (
              <button
                onClick={onSidebarToggle}
                className="hidden lg:flex p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mr-3 transition-colors"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Logo and branding */}
            <Link to="/" className="flex items-center group">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
                {title}
              </span>
            </Link>
          </div>

          {/* Center - Search (optional) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <button
                onClick={onSearchClick}
                className="w-full flex items-center px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <Search className="h-4 w-4 mr-3" />
                <span className="text-sm">Search certificates...</span>
              </button>
            </div>
          )}

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-4">
            {/* Search button for mobile */}
            {showSearch && (
              <button
                onClick={onSearchClick}
                className="md:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Primary CTA */}
            <Link
              to="/verify"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium text-sm"
            >
              Verify Now
            </Link>
            
            {/* User Menu */}
            {userMenu && <UserMenu {...userMenu} />}

            {/* Additional content */}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;