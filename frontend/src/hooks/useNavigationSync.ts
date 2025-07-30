import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext';

export interface NavigationSyncOptions {
  syncOnMount?: boolean;
  syncOnLocationChange?: boolean;
  autoUpdateActiveItems?: boolean;
}

/**
 * Hook to synchronize navigation state with external systems
 * Useful for keeping navigation state in sync with route changes,
 * external state management, or other navigation systems
 */
export const useNavigationSync = (options: NavigationSyncOptions = {}) => {
  const {
    syncOnMount = true,
    syncOnLocationChange = true,
    autoUpdateActiveItems = true
  } = options;

  const location = useLocation();
  const { state, actions } = useNavigation();

  // Sync active items based on current location
  const syncActiveItems = useCallback(() => {
    if (!autoUpdateActiveItems) return;

    const activeItemIds: string[] = [];
    
    // Find items that match the current path
    state.navigationItems.forEach(item => {
      if (isPathActive(item.href, location.pathname)) {
        activeItemIds.push(item.id);
      }
      
      // Check children
      if (item.children) {
        item.children.forEach(child => {
          if (isPathActive(child.href, location.pathname)) {
            activeItemIds.push(child.id);
            // Also activate parent
            if (!activeItemIds.includes(item.id)) {
              activeItemIds.push(item.id);
            }
          }
        });
      }
    });

    // Only update if there are changes
    const currentActiveItems = Array.from(state.activeItems);
    const hasChanges = 
      activeItemIds.length !== currentActiveItems.length ||
      !activeItemIds.every(id => currentActiveItems.includes(id));

    if (hasChanges) {
      actions.setActiveItems(activeItemIds);
    }
  }, [location.pathname, state.navigationItems, state.activeItems, actions, autoUpdateActiveItems]);

  // Helper function to determine if a path is active
  const isPathActive = (itemPath: string, currentPath: string): boolean => {
    if (itemPath === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(itemPath);
  };

  // Sync on mount
  useEffect(() => {
    if (syncOnMount) {
      syncActiveItems();
    }
  }, [syncOnMount, syncActiveItems]);

  // Sync on location change
  useEffect(() => {
    if (syncOnLocationChange) {
      syncActiveItems();
    }
  }, [location.pathname, syncOnLocationChange, syncActiveItems]);

  // Manual sync function
  const manualSync = useCallback(() => {
    syncActiveItems();
  }, [syncActiveItems]);

  // Get navigation state summary
  const getNavigationSummary = useCallback(() => {
    return {
      currentPath: state.currentPath,
      activeItems: Array.from(state.activeItems),
      navigationItems: state.navigationItems.length,
      isTransitioning: state.isTransitioning,
      transitionDirection: state.transitionDirection,
      sidebarCollapsed: state.sidebarCollapsed,
      mobileMenuOpen: state.mobileMenuOpen,
      canGoBack: state.canGoBack,
      canGoForward: state.canGoForward,
      historyLength: state.navigationHistory.length
    };
  }, [state]);

  // Batch update navigation state
  const batchUpdateState = useCallback((updates: {
    activeItems?: string[];
    sidebarCollapsed?: boolean;
    mobileMenuOpen?: boolean;
    indicatorStyle?: 'line' | 'dot' | 'background' | 'border';
    indicatorPosition?: 'left' | 'right' | 'top' | 'bottom';
    animateTransitions?: boolean;
  }) => {
    if (updates.activeItems) {
      actions.setActiveItems(updates.activeItems);
    }
    if (updates.sidebarCollapsed !== undefined) {
      actions.setSidebarCollapsed(updates.sidebarCollapsed);
    }
    if (updates.mobileMenuOpen !== undefined) {
      actions.setMobileMenuOpen(updates.mobileMenuOpen);
    }
    if (updates.indicatorStyle) {
      actions.setActiveIndicatorStyle(updates.indicatorStyle);
    }
    if (updates.indicatorPosition) {
      actions.setActiveIndicatorPosition(updates.indicatorPosition);
    }
    if (updates.animateTransitions !== undefined) {
      actions.setAnimateTransitions(updates.animateTransitions);
    }
  }, [actions]);

  // Reset navigation state to defaults
  const resetNavigationState = useCallback(() => {
    actions.setActiveItems([]);
    actions.setSidebarCollapsed(false);
    actions.setMobileMenuOpen(false);
    actions.setActiveIndicatorStyle('line');
    actions.setActiveIndicatorPosition('left');
    actions.setAnimateTransitions(true);
    actions.toggleActiveIndicator(true);
  }, [actions]);

  return {
    // State
    navigationState: state,
    navigationSummary: getNavigationSummary(),
    
    // Actions
    manualSync,
    batchUpdateState,
    resetNavigationState,
    
    // Utilities
    isPathActive: (path: string) => isPathActive(path, location.pathname),
    getCurrentActiveItems: () => Array.from(state.activeItems),
    
    // Status
    isSynced: true // Could be enhanced to track sync status
  };
};

export default useNavigationSync;