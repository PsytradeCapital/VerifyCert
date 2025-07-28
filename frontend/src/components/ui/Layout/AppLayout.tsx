import React, { useState, useEffect } from 'react';
import SideNavigation, { NavigationItem } from '../Navigation/SideNavigation';
import BottomNavigation, { BottomNavItem } from '../Navigation/BottomNavigation';
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

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen bg-neutral-50 ${className}`}>
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
                className="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 lg:hidden"
                onClick={closeMobileMenu}
              />
            )}
            
            {/* Sidebar */}
            <aside className={`
              ${isMobile 
                ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                  }`
                : 'flex flex-shrink-0'
              }
            `}>
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
                      className="p-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="px-3">
                    <SideNavigation
                      items={navigationItems}
                      collapsed={sidebarCollapsed && !isMobile}
                      onToggle={toggleSidebar}
                    />
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 relative overflow-hidden">
          <div className={`
            h-full py-6 px-4 sm:px-6 lg:px-8
            ${showBottomNav ? 'pb-20' : ''}
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