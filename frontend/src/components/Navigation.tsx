import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import WalletConnect from './WalletConnect';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ui/ThemeToggle';
import { LazyLogo } from './ui/LazyAssets';
import { ariaLabels, generateAriaId } from '../utils/ariaUtils';
import { NavigationFocusManager, focusUtils } from '../utils/focusManagement';

interface NavigationProps {
  walletAddress?: string | null;
  isWalletConnected?: boolean;
  onWalletConnect?: (address: string, provider: any) => void;
  onWalletDisconnect?: () => void;
}

export default function Navigation({
  isWalletConnected = false,
  onWalletConnect,
  onWalletDisconnect,
}: NavigationProps) {
  const location = useLocation();
  const navigation = useNavigation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Focus management refs
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const desktopFocusManagerRef = useRef<NavigationFocusManager | null>(null);
  const mobileFocusManagerRef = useRef<NavigationFocusManager | null>(null);

  const navigationItems = [
    { name: 'Home', href: '/', public: true },
    { name: 'Dashboard', href: '/dashboard', public: false, requireAuth: true },
    { name: 'Verify Certificate', href: '/verify', public: true },
    { name: 'Issue Certificate', href: '/issue', public: false, requireAuth: true, roles: ['issuer', 'admin'] },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Use navigation context for active state
  const isActiveFromContext = (path: string) => {
    const matchingItem = navigation.state.navigationItems.find(item => item.href === path);
    return matchingItem ? navigation.state.activeItems.has(matchingItem.id) : false;
  };

  // Enhanced active state detection
  const getActiveState = (path: string) => {
    const contextActive = isActiveFromContext(path);
    const pathActive = isActivePath(path);
    return contextActive || pathActive;
  };

  const handleWalletConnect = (address: string, provider: any) => {
    onWalletConnect?.(address, provider);
  };

  const handleWalletDisconnect = () => {
    onWalletDisconnect?.();
  };

  const mobileMenuId = generateAriaId('mobile-menu');

  // Initialize focus managers for desktop and mobile navigation
  useEffect(() => {
    if (desktopNavRef.current) {
      const navItems = Array.from(
        desktopNavRef.current.querySelectorAll('[role="menuitem"]')
      ) as HTMLElement[];
      
      if (navItems.length > 0) {
        desktopFocusManagerRef.current = new NavigationFocusManager(navItems, {
          orientation: 'horizontal',
          wrap: true,
        });
      }
    }
  }, [isWalletConnected]); // Re-initialize when wallet connection changes

  // Handle mobile menu focus management
  useEffect(() => {
    if (isMobileMenuOpen && mobileNavRef.current) {
      const navItems = Array.from(
        mobileNavRef.current.querySelectorAll('[role="menuitem"]')
      ) as HTMLElement[];
      
      if (navItems.length > 0) {
        mobileFocusManagerRef.current = new NavigationFocusManager(navItems, {
          orientation: 'vertical',
          wrap: true,
        });
        
        // Focus first item when mobile menu opens
        setTimeout(() => {
          navItems[0]?.focus();
        }, 0);
      }
    } else if (!isMobileMenuOpen && mobileMenuButtonRef.current) {
      // Return focus to menu button when mobile menu closes
      mobileMenuButtonRef.current.focus();
    }
  }, [isMobileMenuOpen]);

  // Handle keyboard navigation for desktop nav
  const handleDesktopNavKeyDown = (event: React.KeyboardEvent) => {
    if (desktopFocusManagerRef.current) {
      desktopFocusManagerRef.current.handleKeyDown(event.nativeEvent);
    }
  };

  // Handle keyboard navigation for mobile nav
  const handleMobileNavKeyDown = (event: React.KeyboardEvent) => {
    if (mobileFocusManagerRef.current) {
      mobileFocusManagerRef.current.handleKeyDown(event.nativeEvent);
    }
    
    // Close mobile menu on Escape
    if (event.key === 'Escape') {
      setIsMobileMenuOpen(false);
    }
  };

  // Handle mobile menu toggle with proper focus management
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    if (!isMobileMenuOpen) {
      // Announce menu opening to screen readers
      focusUtils.announce('Navigation menu opened', 'polite');
    } else {
      // Announce menu closing to screen readers
      focusUtils.announce('Navigation menu closed', 'polite');
    }
  };

  return (
    <nav 
      className="bg-background shadow-sm border-b border-border sticky top-0 z-50 transition-colors duration-200"
      role="navigation"
      aria-label={ariaLabels.navigation.main}
    >
      <div className="container-responsive">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="flex items-center"
                aria-label="VerifyCert home page"
              >
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <LazyLogo 
                    className="h-4 w-4 sm:h-5 sm:w-5 text-white" 
                    alt={ariaLabels.media.logo}
                  />
                </div>
                <span className="ml-2 text-lg sm:text-xl font-bold text-foreground truncate">VerifyCert</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div 
              ref={desktopNavRef}
              className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8"
              role="menubar"
              aria-label="Main navigation menu"
              onKeyDown={handleDesktopNavKeyDown}
            >
              {navigationItems.map((item) => {
                // Show public routes to everyone
                // Show private routes only if authenticated (and wallet connected if needed)
                // Check role requirements if specified
                let shouldShow = item.public;
                
                if (!item.public && item.requireAuth) {
                  shouldShow = isAuthenticated;
                  
                  // Check role requirements
                  if (shouldShow && item.roles && user) {
                    shouldShow = item.roles.includes(user.role);
                  }
                  
                  // Some features might also need wallet connection
                  if (shouldShow && item.name === 'Issue Certificate') {
                    shouldShow = shouldShow && isWalletConnected;
                  }
                }
                
                if (!shouldShow) return null;

                const isActive = getActiveState(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigation.actions.navigateTo(item.href);
                    }}
                    className={`inline-flex items-center px-2 lg:px-3 py-2 border-b-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'border-primary text-foreground bg-primary/10'
                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted'
                    }`}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Navigate to ${item.name}`}
                  >
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Authentication, theme toggle, wallet connection and mobile menu button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Authentication buttons - desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-24">{user?.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            
            {/* Theme toggle */}
            <ThemeToggle size="sm" className="hidden sm:flex" />
            
            {/* Wallet connection - desktop */}
            <div className="hidden md:block">
              <WalletConnect
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                requiredNetwork="polygon-amoy"
              />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                ref={mobileMenuButtonRef}
                onClick={handleMobileMenuToggle}
                className="touch-target p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-controls={mobileMenuId}
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-describedby="mobile-menu-description"
              >
                {!isMobileMenuOpen ? (
                  <svg className="block h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileNavRef}
          id={mobileMenuId}
          className="md:hidden border-t border-border bg-background transition-colors duration-200"
          role="menu"
          aria-label={ariaLabels.navigation.mobileMenu}
          onKeyDown={handleMobileNavKeyDown}
        >
          {/* Screen reader description */}
          <div id="mobile-menu-description" className="sr-only">
            Mobile navigation menu with links to main application sections
          </div>
          
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              // Show public routes to everyone
              // Show private routes only if authenticated (and wallet connected if needed)
              // Check role requirements if specified
              let shouldShow = item.public;
              
              if (!item.public && item.requireAuth) {
                shouldShow = isAuthenticated;
                
                // Check role requirements
                if (shouldShow && item.roles && user) {
                  shouldShow = item.roles.includes(user.role);
                }
                
                // Some features might also need wallet connection
                if (shouldShow && item.name === 'Issue Certificate') {
                  shouldShow = shouldShow && isWalletConnected;
                }
              }
              
              if (!shouldShow) return null;

              const isActive = getActiveState(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigation.actions.navigateTo(item.href);
                    setIsMobileMenuOpen(false);
                    focusUtils.announce(`Navigated to ${item.name}`, 'polite');
                  }}
                  className={`block px-3 py-3 border-l-4 text-base font-medium transition-all duration-200 touch-target ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'
                  }`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navigate to ${item.name}`}
                >
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile authentication, theme toggle and wallet connection */}
          <div className="pt-4 pb-3 border-t border-border bg-muted/50">
            <div className="px-4 space-y-3">
              {/* Mobile authentication */}
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email || user?.phone}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block w-full px-3 py-2 text-sm font-medium text-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-3 py-2 text-sm font-medium text-center border border-border text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              {/* Mobile theme toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-medium text-foreground">Theme</span>
                <ThemeToggle size="sm" variant="switch" />
              </div>
              
              {/* Mobile wallet connection */}
              <WalletConnect
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                requiredNetwork="polygon-amoy"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}