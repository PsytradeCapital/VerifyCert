import React, { useState, useEffect } from 'react';
import SideNavigation, { NavigationItem } from '../Navigation/SideNavigation';
import { BottomNavigation, BottomNavItem } from '../Navigation/BottomNavigation';
import Header, { UserMenuProps } from './Header';

export interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showBottomNav?: boolean;
  navigationItems?: NavigationItem[];
  bottomNavItems?: BottomNavItem[];
  className?: string;
  title?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  userMenu?: UserMenuProps;
  headerChildren?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
  showBottomNav = false,
  navigationItems = [],
  bottomNavItems = [],
  className = '',
  title = 'VerifyCert',
  showSearch = false,
  onSearchClick,
  userMenu,
  headerChildren
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior with improved breakpoint detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      const tablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      
      setIsMobile(mobile);
      
      // Auto-close mobile menu when switching to desktop
      if (!mobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      
      // Auto-expand sidebar on desktop if it was collapsed due to mobile
      if (!mobile && !tablet) {
        // Only auto-expand if we're coming from mobile, not if user manually collapsed
        const wasManuallyCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (!wasManuallyCollapsed) {
          setSidebarCollapsed(false);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      const newCollapsed = !sidebarCollapsed;
      setSidebarCollapsed(newCollapsed);
      // Remember user preference for desktop
      localStorage.setItem('sidebar-collapsed', newCollapsed.toString());
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen bg-neutral-50 safe-area-y ${className}`}>
      {/* Skip Navigation Links */}
      <div className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="absolute top-0 left-0 z-50 px-4 py-2 bg-blue-600 text-white rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onFocus={(e) => {
            // Ensure the link is visible when focused
            e.target.classList.remove('sr-only');
          }}
          onBlur={(e) => {
            // Hide the link when focus is lost
            e.target.classList.add('sr-only');
          }}
        >
          Skip to main content
        </a>
        {showSidebar && (
          <a
            href="#navigation"
            className="absolute top-0 left-20 z-50 px-4 py-2 bg-blue-600 text-white rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onFocus={(e) => {
              e.target.classList.remove('sr-only');
            }}
            onBlur={(e) => {
              e.target.classList.add('sr-only');
            }}
          >
            Skip to navigation
          </a>
        )}
      </div>

      {/* Header */}
      <Header
        title={title}
        showSidebarToggle={showSidebar}
        sidebarCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onSidebarToggle={toggleSidebar}
        onMobileMenuToggle={toggleSidebar}
        showSearch={showSearch}
        onSearchClick={onSearchClick}
        userMenu={userMenu}
      >
        {headerChildren}
      </Header>

      <div className="flex">
        {/* Sidebar - Desktop and Mobile Overlay */}
        {showSidebar && (
          <>
            {/* Mobile overlay */}
            {isMobile && mobileMenuOpen && (
              <div 
                className="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 lg:hidden touch-none"
                onClick={closeMobileMenu}
                onTouchStart={(e) => e.preventDefault()}
              />
            )}
            
            {/* Sidebar */}
            <aside 
              id="navigation"
              className={`
                ${isMobile 
                  ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out safe-area-x ${
                      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`
                  : 'flex flex-shrink-0'
                }
              `}
            >
              <div className={`
                flex flex-col bg-white border-r border-neutral-200 transition-all duration-300 ease-in-out
                ${isMobile ? 'w-64' : (sidebarCollapsed ? 'w-16' : 'w-64')}
              `}>
                {/* Sidebar header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                  {(!sidebarCollapsed || isMobile) && (
                    <h2 className="text-lg font-semibold text-neutral-900">Navigation</h2>
                  )}
                  {isMobile && (
                    <button
                      onClick={closeMobileMenu}
                      className="touch-target p-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Close navigation menu"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4" role="navigation" aria-label="Main navigation">
                  <div className="px-3">
                    <SideNavigation
                      items={navigationItems}
                      collapsed={sidebarCollapsed && !isMobile}
                      onToggle={toggleSidebar}
                    />
                  </div>
                </nav>
              </div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main id="main-content" className="flex-1 relative overflow-hidden" role="main">
          <div className={`
            h-full mobile-padding-y mobile-padding-x
            ${showBottomNav ? 'pb-20 sm:pb-24' : ''}
          `}>
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      {showBottomNav && (
        <div className="lg:hidden">
          <BottomNavigation items={bottomNavItems} />
        </div>
      )}
    </div>
  );
};

export default AppLayout;