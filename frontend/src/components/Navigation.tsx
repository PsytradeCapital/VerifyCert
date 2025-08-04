import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import WalletConnect from './WalletConnect';
import { useNavigation } from '../contexts/NavigationContext';
import { useActiveIndicator } from '../hooks/useActiveIndicator';
import { ThemeToggle } from './ui/ThemeToggle';
import { LazyLogo } from './ui/LazyAssets';
import { ariaLabels, generateAriaId } from '../utils/ariaUtils';

interface NavigationProps {
  walletAddress?: string | null;
  isWalletConnected?: boolean;
  onWalletConnect?: (address: string, provider: any) => void;
  onWalletDisconnect?: () => void;
}

export default function Navigation({
  walletAddress,
  isWalletConnected = false,
  onWalletConnect,
  onWalletDisconnect,
}: NavigationProps) {
  const location = useLocation();
  const navigation = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/', public: true },
    { name: 'Dashboard', href: '/dashboard', public: false },
    { name: 'Verify Certificate', href: '/verify', public: true },
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

  const navId = generateAriaId('main-nav');
  const mobileMenuId = generateAriaId('mobile-menu');

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
              className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8"
              role="menubar"
              aria-label="Main navigation menu"
            >
              {navigationItems.map((item) => {
                // Show all public routes, and private routes only if wallet is connected
                const shouldShow = item.public || isWalletConnected;
                
                if (!shouldShow) return null;

                const isActive = getActiveState(item.href);
                const matchingItem = navigation.state.navigationItems.find(navItem => navItem.href === item.href);
                const indicatorStyles = useActiveIndicator(matchingItem?.id || item.name, isActive);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigation.actions.navigateTo(item.href);
                    }}
                    className={`${indicatorStyles.containerClasses} inline-flex items-center px-2 lg:px-3 py-2 border-b-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? `border-primary text-foreground bg-primary/10 ${indicatorStyles.itemClasses}`
                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted'
                    } ${indicatorStyles.transitionClasses}`}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Navigate to ${item.name}`}
                  >
                    {/* Active indicator */}
                    {isActive && <div className={indicatorStyles.indicatorClasses} />}
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Theme toggle, wallet connection and mobile menu button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <ThemeToggle size="sm" className="hidden sm:flex" />
            
            {/* Wallet connection - desktop */}
            <div className="hidden md:block">
              <WalletConnect
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                requiredNetwork="polygon-mumbai"
              />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
          id={mobileMenuId}
          className="md:hidden border-t border-border bg-background transition-colors duration-200"
          role="menu"
          aria-label={ariaLabels.navigation.mobileMenu}
        >
          {/* Screen reader description */}
          <div id="mobile-menu-description" className="sr-only">
            Mobile navigation menu with links to main application sections
          </div>
          
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              // Show all public routes, and private routes only if wallet is connected
              const shouldShow = item.public || isWalletConnected;
              
              if (!shouldShow) return null;

              const isActive = getActiveState(item.href);
              const matchingItem = navigation.state.navigationItems.find(navItem => navItem.href === item.href);
              const indicatorStyles = useActiveIndicator(matchingItem?.id || item.name, isActive);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigation.actions.navigateTo(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`${indicatorStyles.containerClasses} block px-3 py-3 border-l-4 text-base font-medium transition-all duration-200 touch-target ${
                    isActive
                      ? `bg-primary/10 border-primary text-primary ${indicatorStyles.itemClasses}`
                      : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'
                  } ${indicatorStyles.transitionClasses}`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navigate to ${item.name}`}
                >
                  {/* Active indicator */}
                  {isActive && <div className={indicatorStyles.indicatorClasses} />}
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile theme toggle and wallet connection */}
          <div className="pt-4 pb-3 border-t border-border bg-muted/50">
            <div className="px-4 space-y-3">
              {/* Mobile theme toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Theme</span>
                <ThemeToggle size="sm" variant="switch" />
              </div>
              
              {/* Mobile wallet connection */}
              <WalletConnect
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                requiredNetwork="polygon-mumbai"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}