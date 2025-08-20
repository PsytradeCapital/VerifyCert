import React from 'react';
import { useNavigation } from '../../../contexts/NavigationContext';

export interface NavigationStateManagerProps {
  children?: React.ReactNode;
  className?: string;

export interface NavigationControlsProps {
  showIndicatorControls?: boolean;
  showTransitionControls?: boolean;
  showHistoryControls?: boolean;
  className?: string;

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  showIndicatorControls = true,
  showTransitionControls = true,
  showHistoryControls = true,
  className = ''
}) => {
  const { state, actions } = useNavigation();

  return (
    <div className={`space-y-4 p-4 bg-neutral-50 rounded-lg border ${className}`}>
      <h3 className="text-sm font-semibold text-neutral-900">Navigation Controls</h3>
      
      {/* Active Indicator Controls */}
      {showIndicatorControls && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-700">Active Indicators</h4>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={state.activeIndicators.showActiveIndicator}
                onChange={(e) => actions.toggleActiveIndicator(e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-neutral-600">Show Indicators</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-neutral-600 mb-1">Style</label>
              <select
                value={state.activeIndicators.indicatorStyle}
                onChange={(e) => actions.setActiveIndicatorStyle(e.target.value as any)}
                className="w-full text-xs border border-neutral-300 rounded px-2 py-1"
                aria-label="Style"
              >
                <option value="line">Line</option>
                <option value="dot">Dot</option>
                <option value="background">Background</option>
                <option value="border">Border</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-neutral-600 mb-1">Position</label>
              <select
                value={state.activeIndicators.indicatorPosition}
                onChange={(e) => actions.setActiveIndicatorPosition(e.target.value as any)}
                className="w-full text-xs border border-neutral-300 rounded px-2 py-1"
                aria-label="Position"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Transition Controls */}
      {showTransitionControls && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-700">Transitions</h4>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={state.activeIndicators.animateTransitions}
                onChange={(e) => actions.setAnimateTransitions(e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-neutral-600">Animate Transitions</span>
            </label>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-neutral-500">
              Status: {state.isTransitioning ? 'Transitioning' : 'Idle'}
              {state.transitionDirection !== 'none' && ` (${state.transitionDirection})`}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Duration (ms)</label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={state.transitionDuration}
                  onChange={(e) => actions.setTransitionDuration(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-neutral-500 text-center">{state.transitionDuration}ms</div>
              </div>
              
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Easing</label>
                <select
                  value={state.transitionEasing}
                  onChange={(e) => actions.setTransitionEasing(e.target.value as any)}
                  className="w-full text-xs border border-neutral-300 rounded px-2 py-1"
                >
                  <option value="ease-in-out">Ease In Out</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="linear">Linear</option>
                </select>
              </div>
            </div>
            
            {state.pendingNavigation && (
              <div className="text-xs text-blue-600">
                Pending: {state.pendingNavigation}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Controls */}
      {showHistoryControls && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-700">Navigation History</h4>
          
          <div className="flex space-x-2">
            <button
              onClick={actions.goBack}
              disabled={!state.canGoBack}
              className="px-2 py-1 text-xs bg-neutral-200 text-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-300"
            >
              ← Back
            </button>
            <button
              onClick={actions.goForward}
              disabled={!state.canGoForward}
              className="px-2 py-1 text-xs bg-neutral-200 text-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-300"
            >
              Forward →
            </button>
          </div>

          <div className="text-xs text-neutral-500">
            History: {state.navigationHistory.length} pages
          </div>
        </div>
      )}

      {/* Current State Display */}
      <div className="space-y-1 pt-2 border-t border-neutral-200">
        <div className="text-xs text-neutral-500">
          Current: {state.currentPath}
        </div>
        <div className="text-xs text-neutral-500">
          Active Items: {Array.from(state.activeItems).join(', ') || 'None'}
        </div>
        <div className="text-xs text-neutral-500">
          Sidebar: {state.sidebarCollapsed ? 'Collapsed' : 'Expanded'}
        </div>
        <div className="text-xs text-neutral-500">
          Mobile Menu: {state.mobileMenuOpen ? 'Open' : 'Closed'}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 pt-2 border-t border-neutral-200">
        <h4 className="text-xs font-medium text-neutral-700">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => actions.toggleSidebar()}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Toggle Sidebar
          </button>
          <button
            onClick={() => actions.toggleMobileMenu()}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Toggle Mobile
          </button>
        </div>
      </div>
    </div>
  );
};

export const NavigationStateManager: React.FC<NavigationStateManagerProps> = ({
  children,
  className = ''
}) => {
  const { state } = useNavigation();

  return (
    <div className={`navigation-state-manager ${className}`}>
      {children}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <details className="bg-white border border-neutral-300 rounded-lg shadow-lg">
            <summary className="px-3 py-2 text-xs font-medium cursor-pointer hover:bg-neutral-50">
              Navigation State
            </summary>
            <div className="p-3 border-t border-neutral-200 max-w-xs">
              <pre className="text-xs text-neutral-600 whitespace-pre-wrap">
                {JSON.stringify({
                  currentPath: state.currentPath,
                  activeItems: Array.from(state.activeItems),
                  isTransitioning: state.isTransitioning,
                  transitionDirection: state.transitionDirection,
                  sidebarCollapsed: state.sidebarCollapsed,
                  mobileMenuOpen: state.mobileMenuOpen
                }, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default NavigationStateManager;
}}