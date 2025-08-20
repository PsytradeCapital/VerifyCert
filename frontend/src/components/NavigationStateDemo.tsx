import React from 'react';
import { useNavigation, NavigationItem } from '../contexts/NavigationContext';
import { useNavigationSync } from '../hooks/useNavigationSync';
import { useNavigationTransitions } from '../hooks/useNavigationTransitions';
import { NavigationControls } from './ui/Navigation/NavigationStateManager';
import SideNavigation from './ui/Navigation/SideNavigation';
import { BottomNavigation } from './ui/Navigation/BottomNavigation';

/**
 * Demo component to showcase navigation state management and active indicators
 */
const NavigationStateDemo: React.FC = () => {
  const { state, actions } = useNavigation();
  const navigationSync = useNavigationSync({
    syncOnMount: true,
    syncOnLocationChange: true,
    autoUpdateActiveItems: true
  });
  const { 
    navigateWithTransition, 
    transitionState
  } = useNavigationTransitions({
    enablePreloading: true,
    enableStaggeredAnimations: true
  });

  // Demo navigation items
  const demoItems: NavigationItem[] = [
    {
      id: 'demo-home',
      label: 'Home',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      public: true
    },
    {
      id: 'demo-verify',
      label: 'Verify',
      href: '/verify',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: "2",
      public: true
    },
    {
      id: 'demo-dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
        </svg>
      ),
      public: false
  ];

  const handleTestTransition = (direction: 'forward' | 'backward') => {
    // Test transition with actual navigation
    const currentPath = state.currentPath;
    const targetPath = direction === 'forward' ? '/verify' : '/';
    
    if (currentPath !== targetPath) {
      navigateWithTransition(targetPath, direction);
    } else {
      // Just test the visual transition without navigation
      actions.startTransition(direction);
      setTimeout(() => {
        actions.endTransition();
      }, state.transitionDuration);
  };

  const handleUpdateBadge = () => {
    const randomBadge = Math.floor(Math.random() * 10) + 1;
    actions.updateItemBadge('demo-verify', randomBadge);
  };

  // Convert NavigationItem to SideNavigation format
  const convertToSideNavItems = (items: NavigationItem[]) => {
    return items.filter(item => item.icon).map(item => ({
      id: item.id,
      label: item.label,
      href: item.href,
      path: item.href,
      badge: typeof item.badge === 'number' ? item.badge.toString() : item.badge,
      icon: ({ className }: { className?: string }) => (
        <div className={className}>
          {item.icon}
        </div>
      ),
      active: item.active,
      disabled: item.disabled,
      public: item.public
    }));
  };

  // Convert NavigationItem to BottomNavigation format
  const convertToBottomNavItems = (items: NavigationItem[]) => {
    return items.filter(item => item.icon).map(item => ({
      ...item,
      badge: typeof item.badge === 'number' ? item.badge.toString() : item.badge,
      icon: item.icon!
    }));
  };



  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Navigation State Management Demo
          </h1>
          <p className="text-gray-600">
            Interactive demo showcasing enhanced navigation state management with active indicators and smooth transitions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <NavigationControls />
            
            {/* Demo Actions */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Demo Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => actions.updateNavigationItems(demoItems)}
                  className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Load Demo Items
                </button>
                
                <button
                  onClick={handleUpdateBadge}
                  className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Update Badge
                </button>
                
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTestTransition('forward')}
                      className="flex-1 px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                      disabled={transitionState.isTransitioning}
                    >
                      Test Forward
                    </button>
                    <button
                      onClick={() => handleTestTransition('backward')}
                      className="flex-1 px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                      disabled={transitionState.isTransitioning}
                    >
                      Test Backward
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigateWithTransition('/', 'backward')}
                      className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      disabled={transitionState.isTransitioning}
                    >
                      Go Home
                    </button>
                    <button
                      onClick={() => navigateWithTransition('/verify', 'forward')}
                      className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      disabled={transitionState.isTransitioning}
                    >
                      Go Verify
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => navigationSync.resetNavigationState()}
                  className="w-full px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reset State
                </button>
              </div>
            </div>

            {/* Navigation Summary */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Navigation Summary</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div>Current Path: <span className="font-mono">{navigationSync.navigationSummary.currentPath}</span></div>
                <div>Active Items: {navigationSync.navigationSummary.activeItems.join(', ') || 'None'}</div>
                <div>Transitioning: {transitionState.isTransitioning ? 'Yes' : 'No'}</div>
                <div>Direction: {transitionState.transitionDirection}</div>
                <div>Progress: {Math.round(transitionState.transitionProgress)}%</div>
                <div>Duration: {state.transitionDuration}ms</div>
                <div>Easing: {state.transitionEasing}</div>
                <div>Sidebar: {navigationSync.navigationSummary.sidebarCollapsed ? 'Collapsed' : 'Expanded'}</div>
                <div>Mobile Menu: {navigationSync.navigationSummary.mobileMenuOpen ? 'Open' : 'Closed'}</div>
                {transitionState.pendingNavigation && (
                  <div>Pending: <span className="font-mono text-blue-600">{transitionState.pendingNavigation}</span></div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Components Demo */}
          <div className="lg:col-span-2 space-y-8">
            {/* Side Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Side Navigation with Active Indicators
              </h2>
              <div className="flex space-x-8">
                <div className="w-64">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Normal</h3>
                  <SideNavigation 
                    items={convertToSideNavItems(demoItems)}
                    collapsed={false}
                  />
                </div>
                <div className="w-16">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Collapsed</h3>
                  <SideNavigation 
                    items={convertToSideNavItems(demoItems)}
                    collapsed={true}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Bottom Navigation with Active Indicators
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Default Style</h3>
                  <div className="relative bg-gray-100 rounded-lg p-4" style={{ height: '120px' }}>
                    <BottomNavigation 
                      items={convertToBottomNavItems(demoItems)}
                      variant="default"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Floating Style</h3>
                  <div className="relative bg-gray-100 rounded-lg p-4" style={{ height: '120px' }}>
                    <BottomNavigation 
                      items={convertToBottomNavItems(demoItems)}
                      variant="floating"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Indicator Styles Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Indicator Styles Preview
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {['line', 'dot', 'background', 'border'].map((style) => (
                  <div key={style} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">{style}</h4>
                    <button
                      onClick={() => actions.setActiveIndicatorStyle(style as any)}
                      className={`w-full px-3 py-2 text-sm rounded transition-colors ${
                        state.activeIndicators.indicatorStyle === style
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Apply {style} style
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationStateDemo;
}}