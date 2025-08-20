import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useNavigationTransitions } from '../hooks/useNavigationTransitions';
import { SideNavigation, BottomNavigation, FloatingActionButton } from '../components/ui';
import { Container } from '../components/ui';

const NavigationDemo: React.FC = () => {
  const { state, actions } = useNavigation();
  const { transition, getTransitionClasses } = useNavigationTransitions();

  const demoNavigationItems = [
    {
      id: 'demo-home',
      label: 'Demo Home',
      href: '/navigation-demo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      public: true
    },
    {
      id: 'demo-features',
      label: 'Features',
      href: '/features',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
        </svg>
      ),
      public: true,
      children: [
        {
          id: 'demo-navigation',
          label: 'Navigation',
          href: '/features/navigation',
          public: true
        },
        {
          id: 'demo-forms',
          label: 'Forms',
          href: '/features/forms',
          public: true
      ]
    },
    {
      id: 'demo-settings',
      label: 'Settings',
      href: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      public: true,
      badge: '2'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Navigation State Management Demo
            </h1>
            <p className="text-gray-600">
              This page demonstrates the navigation state management system with active indicators,
              transitions, and context-based navigation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Navigation State Display */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Navigation State
                </h2>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Current Path:</span>
                    <span className="ml-2 text-blue-600 font-mono">
                      {state.currentPath}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Active Items:</span>
                    <div className="ml-2 mt-1">
                      {Array.from(state.activeItems).map(itemId => (
                        <span
                          key={itemId}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                        >
                          {itemId}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Sidebar Collapsed:</span>
                    <span className={`ml-2 ${state.sidebarCollapsed ? 'text-green-600' : 'text-gray-500'}`}>
                      {state.sidebarCollapsed ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Mobile Menu Open:</span>
                    <span className={`ml-2 ${state.mobileMenuOpen ? 'text-green-600' : 'text-gray-500'}`}>
                      {state.mobileMenuOpen ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Can Go Back:</span>
                    <span className={`ml-2 ${state.canGoBack ? 'text-green-600' : 'text-gray-500'}`}>
                      {state.canGoBack ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium text-gray-700 mb-3">Transition State</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Is Transitioning:</span>
                      <span className={`ml-2 ${transition.isTransitioning ? 'text-orange-600' : 'text-gray-500'}`}>
                        {transition.isTransitioning ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Direction:</span>
                      <span className="ml-2 text-gray-700">
                        {transition.transitionDirection}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium text-gray-700 mb-3">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => actions.toggleSidebar()}
                      className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Toggle Sidebar
                    </button>
                    <button
                      onClick={() => actions.toggleMobileMenu()}
                      className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Toggle Mobile Menu
                    </button>
                    <button
                      onClick={() => actions.updateItemBadge('demo-settings', Math.floor(Math.random() * 10).toString())}
                      className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Update Badge
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Components Demo */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {/* Side Navigation Demo */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Side Navigation with Active Indicators
                  </h2>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <SideNavigation
                      items={demoNavigationItems}
                      collapsed={state.sidebarCollapsed}
                      useContext={false}
                      className="max-w-xs"
                    />
                  </div>
                </div>

                {/* Bottom Navigation Demo */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Bottom Navigation (Mobile)
                  </h2>
                  <div className="relative border rounded-lg p-4 bg-gray-50 h-32">
                    <div className="absolute inset-x-4 bottom-4">
                      <BottomNavigation
                        items={demoNavigationItems.filter(item => !item.children)}
                        variant="floating"
                        useContext={false}
                        className="relative"
                      />
                    </div>
                  </div>
                </div>

                {/* Floating Action Button Demo */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Floating Action Button
                  </h2>
                  <div className="relative border rounded-lg p-4 bg-gray-50 h-32">
                    <FloatingActionButton d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      onClick={() => alert('FAB clicked!')}
                      position="bottom-right"
                      tooltip="Add new item"
                      badge="3"
                      className="relative"
                      useContext={false}
                    />
                  </div>
                </div>

                {/* Transition Classes Demo */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Transition Classes
                  </h2>
                  <div 
                    className={getTransitionClasses('p-4 bg-blue-100 rounded-lg border-2 border-blue-200')}
                  >
                    <p className="text-blue-800">
                      This element uses transition classes that change based on navigation state.
                      The classes applied are: <code className="bg-blue-200 px-1 rounded text-xs">
                        {getTransitionClasses().split(' ').join(', ')}
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NavigationDemo;
}}