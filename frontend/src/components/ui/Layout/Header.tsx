import React from 'react';
import { Search, Menu, X, Bell, User } from 'lucide-react';
import Button from '../Button/Button';

export interface UserMenuProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut?: () => void;
  onProfile?: () => void;
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
  children?: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = 'VerifyCert',
  showSidebarToggle = false,
  sidebarCollapsed = false,
  isMobile = false,
  mobileMenuOpen = false,
  onSidebarToggle,
  onMobileMenuToggle,
  showSearch = false,
  onSearchClick,
  userMenu,
  children,
  className = ''
}) => {
  return (
    <header className={`
      sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm safe-top safe-area-x
      ${className}
    `}>
      <div className="flex items-center justify-between h-16 mobile-padding-x">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          {isMobile && showSidebarToggle && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onMobileMenuToggle}
              className="lg:hidden touch-target"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Desktop Sidebar Toggle */}
          {!isMobile && showSidebarToggle && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSidebarToggle}
              className="hidden lg:flex"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 hidden sm:block">
              {title}
            </h1>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex-1 max-w-lg mx-8 hidden md:block">
          {showSearch && (
            <div className="relative">
              <button
                onClick={onSearchClick}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-neutral-500 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Search className="h-5 w-5" />
                <span className="text-sm">Search certificates...</span>
              </button>
            </div>
          )}
          {children}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Mobile Search */}
          {showSearch && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSearchClick}
              className="md:hidden touch-target"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="secondary"
            size="sm"
            className="relative touch-target"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-error-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          {userMenu ? (
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center space-x-2 touch-target"
                onClick={userMenu.onProfile}
              >
                {userMenu.user?.avatar ? (
                  <img
                    src={userMenu.user.avatar}
                    alt={userMenu.user.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium">
                  {userMenu.user?.name || 'User'}
                </span>
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="touch-target"
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;