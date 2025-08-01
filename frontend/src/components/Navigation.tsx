import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import WalletConnect from './WalletConnect';
import { useNavigation } from '../contexts/NavigationContext';
import { useActiveIndicator } from '../hooks/useActiveIndicator';

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

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 truncate">VerifyCert</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8">
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
                        ? `border-blue-500 text-gray-900 bg-blue-50/50 ${indicatorStyles.itemClasses}`
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                    } ${indicatorStyles.transitionClasses}`}
                  >
                    {/* Active indicator */}
                    {isActive && <div className={indicatorStyles.indicatorClasses} />}
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Wallet connection and mobile menu button */}
          <div className="flex items-center gap-2 sm:gap-3">
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
                className="touch-target p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
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
        <div className="md:hidden border-t border-gray-200 bg-white">
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
                      ? `bg-blue-50 border-blue-500 text-blue-700 ${indicatorStyles.itemClasses}`
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } ${indicatorStyles.transitionClasses}`}
                >
                  {/* Active indicator */}
                  {isActive && <div className={indicatorStyles.indicatorClasses} />}
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile wallet connection */}
          <div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50">
            <div className="px-4">
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