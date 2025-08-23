import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { NavigationControls } from '../components/ui/Navigation/NavigationStateManager';
import SideNavigation from '../components/ui/Navigation/SideNavigation';
import { BottomNavigation } from '../components/ui/Navigation/BottomNavigation';
import AppLayout from '../components/ui/Layout/AppLayout';

const NavigationStateDemo: React.FC = () => {
  const { state, actions } = useNavigation();

  // Demo navigation items with various states
  const demoItems = [
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
      label: 'Verify Certificate',
      href: '/verify',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      public: true,
      badge: 3
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
      public: false,
      children: [
        {
          id: 'demo-certificates',
          label: 'Certificates',
          href: '/dashboard/certificates',
          public: false
        },
        {
          id: 'demo-settings',
          label: 'Settings',
          href: '/dashboard/settings',
          public: false,
          badge: 'New'
      ]
    },
    {
      id: 'demo-disabled',
      label: 'Disabled Item',
      href: '/disabled',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      disabled: true,
      public: true
  ];

  const handleUpdateItems = () => {
    actions.updateNavigationItems(demoItems);
  };

  const handleAddBadge = () => {
    actions.updateItemBadge('demo-verify', Math.floor(Math.random() * 10) + 1);
  };

  const handleRemoveBadge = () => {
    actions.updateItemBadge('demo-verify', undefined);
  };

  const handleTestTransition = (direction: 'forward' | 'backward') => {
    actions.startTransition(direction);
    setTimeout(() => {
      actions.endTransition();
    }, 300);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Navigation State Management Demo
          </h1>
          <p className="text-neutral-600">
            Explore the enhanced navigation system with active indicators, state management, and smooth transitions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <NavigationControls />
            
            {/* Additional Demo Controls */}
            <div className="mt-4 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900">Demo Actions</h3>
              
              <div className="space-y-2">
                <button
                  onClick={handleUpdateItems}
                  className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Update Navigation Items
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddBadge}
                    className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Add Badge
                  </button>
                  <button
                    onClick={handleRemoveBadge}
                    className="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Remove Badge
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTestTransition('forward')}
                    className="flex-1 px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Test Forward
                  </button>
                  <button
                    onClick={() => handleTestTransition('backward')}
                    className="flex-1 px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Test Backward
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Demos */}
          <div className="lg:col-span-2 space-y-8">
            {/* Side Navigation Demo */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Side Navigation with Active Indicators
              </h2>
              <div className="flex space-x-8">
                <div className="w-64">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Normal</h3>
                  <SideNavigation 
                    items={demoItems}
                    collapsed={false}
                    useContext={false}
                  />
                </div>
                <div className="w-16">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Collapsed</h3>
                  <SideNavigation 
                    items={demoItems}
                    collapsed={true}
                    useContext={false}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Navigation Demo */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Bottom Navigation with Active Indicators
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Default Style</h3>
                  <div className="relative bg-neutral-100 rounded-lg p-4" style={{ height: '120px' }}>
                    <BottomNavigation 
                      items={demoItems.slice(0, 4)}
                      variant="default"
                      useContext={false}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Floating Style</h3>
                  <div className="relative bg-neutral-100 rounded-lg p-4" style={{ height: '120px' }}>
                    <BottomNavigation 
                      items={demoItems.slice(0, 4)}
                      variant="floating"
                      useContext={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* State Information */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Current Navigation State
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Active Items</h3>
                  <div className="text-sm text-neutral-600">
                    {Array.from(state.activeItems).length > 0 
                      ? Array.from(state.activeItems).join(', ')
                      : 'None'
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Current Path</h3>
                  <div className="text-sm text-neutral-600 font-mono">
                    {state.currentPath}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Transition State</h3>
                  <div className="text-sm text-neutral-600">
                    {state.isTransitioning 
                      ? `Transitioning (${state.transitionDirection})`
                      : 'Idle'
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">History Length</h3>
                  <div className="text-sm text-neutral-600">
                    {state.navigationHistory.length} pages
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NavigationStateDemo;
}
}}}