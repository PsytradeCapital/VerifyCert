import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routeConfig, matchRoute } from '../config/routes';

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href: string;
  active?: boolean;
  children?: NavigationItem[];
  badge?: string | number;
  disabled?: boolean;
  public?: boolean;

export interface NavigationState {
  // Current navigation state
  currentPath: string;
  currentRoute: string;
  activeItems: Set<string>;
  
  // Navigation items
  navigationItems: NavigationItem[];
  
  // UI state
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  
  // Navigation history
  navigationHistory: string[];
  canGoBack: boolean;
  canGoForward: boolean;
  
  // Active indicators
  activeIndicators: {
    showActiveIndicator: boolean;
    indicatorPosition: 'left' | 'right' | 'top' | 'bottom';
    indicatorStyle: 'line' | 'dot' | 'background' | 'border';
    animateTransitions: boolean;
  };
  
  // Navigation transitions
  isTransitioning: boolean;
  transitionDirection: 'forward' | 'backward' | 'none';
  transitionDuration: number;
  transitionEasing: 'ease-in-out' | 'ease-in' | 'ease-out' | 'linear';
  pendingNavigation: string | null;

export interface NavigationActions {
  // Navigation actions
  navigateTo: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  
  // UI actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Item management
  setActiveItem: (itemId: string) => void;
  setActiveItems: (itemIds: string[]) => void;
  addActiveItem: (itemId: string) => void;
  removeActiveItem: (itemId: string) => void;
  updateNavigationItems: (items: NavigationItem[]) => void;
  updateItemBadge: (itemId: string, badge?: string | number) => void;
  
  // Active indicator management
  setActiveIndicatorStyle: (style: 'line' | 'dot' | 'background' | 'border') => void;
  setActiveIndicatorPosition: (position: 'left' | 'right' | 'top' | 'bottom') => void;
  toggleActiveIndicator: (show: boolean) => void;
  setAnimateTransitions: (animate: boolean) => void;
  
  // Transition management
  startTransition: (direction: 'forward' | 'backward', duration?: number) => void;
  endTransition: () => void;
  setTransitionDuration: (duration: number) => void;
  setTransitionEasing: (easing: 'ease-in-out' | 'ease-in' | 'ease-out' | 'linear') => void;

export interface NavigationContextType {
  state: NavigationState;
  actions: NavigationActions;

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export interface NavigationProviderProps {
  children: ReactNode;
  initialItems?: NavigationItem[];
  isWalletConnected?: boolean;

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialItems = [],
  isWalletConnected = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default navigation items based on routes
  const defaultNavigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      public: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'verify',
      label: 'Verify Certificate',
      href: '/verify',
      public: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'dashboard',
      label: 'Issuer Dashboard',
      href: '/dashboard',
      public: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
        </svg>
      )
  ];

  const [state, setState] = useState<NavigationState>({
    currentPath: location.pathname,
    currentRoute: location.pathname,
    activeItems: new Set(),
    navigationItems: initialItems.length > 0 ? initialItems : defaultNavigationItems,
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    navigationHistory: [location.pathname],
    canGoBack: false,
    canGoForward: false,
    activeIndicators: {
      showActiveIndicator: true,
      indicatorPosition: 'left',
      indicatorStyle: 'line',
      animateTransitions: true
    },
    isTransitioning: false,
    transitionDirection: 'none',
    transitionDuration: 300,
    transitionEasing: 'ease-in-out',
    pendingNavigation: null
  });

  // Update active items based on current location
  useEffect(() => {
    const updateActiveItems = () => {
      const newActiveItems = new Set<string>();
      
      // Filter items based on wallet connection
      const visibleItems = state.navigationItems.filter(item => 
        item.public || isWalletConnected
      );

      // Find active items based on current path
      visibleItems.forEach(item => {
        if (isItemActive(item.href, location.pathname)) {
          newActiveItems.add(item.id);
        
        // Check children for active state
        if (item.children) {
          item.children.forEach(child => {
            if (isItemActive(child.href, location.pathname)) {
              newActiveItems.add(child.id);
              newActiveItems.add(item.id); // Also mark parent as active
          });
      });

      // Only update state if active items have actually changed
      setState(prev => {
        const activeItemsChanged = 
          prev.activeItems.size !== newActiveItems.size ||
          !Array.from(newActiveItems).every(item => prev.activeItems.has(item));

        if (activeItemsChanged || prev.currentPath !== location.pathname) {
          return {
            ...prev,
            currentPath: location.pathname,
            currentRoute: location.pathname,
            activeItems: newActiveItems
          };
        return prev;
      });
    };

    updateActiveItems();
  }, [location.pathname, state.navigationItems, isWalletConnected]);

  // Helper function to determine if an item is active
  const isItemActive = (itemPath: string, currentPath: string): boolean => {
    if (itemPath === '/') {
      return currentPath === '/';
    return currentPath.startsWith(itemPath);
  };

  // Navigation actions
  const actions: NavigationActions = {
    navigateTo: (path: string) => {
      // Don't navigate if already on the same path or if currently transitioning
      if (location.pathname === path || state.isTransitioning) {
        return;

      // Check if animations are enabled
      const shouldAnimate = state.activeIndicators.animateTransitions;
      const transitionDuration = state.transitionDuration;
      
      // Start transition if animations are enabled
      if (shouldAnimate) {
        setState(prev => {
          const currentIndex = prev.navigationHistory.indexOf(prev.currentPath);
          const targetIndex = prev.navigationHistory.indexOf(path);
          const direction = targetIndex > currentIndex ? 'forward' : 'backward';
          
          return {
            ...prev,
            isTransitioning: true,
            transitionDirection: direction,
            pendingNavigation: path
          };
        });

        // Navigate after transition starts
        setTimeout(() => {
          navigate(path);
        }, transitionDuration * 0.3); // Start navigation 30% through transition

        // Complete transition after full duration
        setTimeout(() => {
          setState(prev => {
            const newHistory = [...prev.navigationHistory];
            if (newHistory[newHistory.length - 1] !== path) {
              newHistory.push(path);
            
            return {
              ...prev,
              navigationHistory: newHistory,
              canGoBack: newHistory.length > 1,
              canGoForward: false,
              isTransitioning: false,
              transitionDirection: 'none',
              pendingNavigation: null
            };
          });
        }, transitionDuration);
      } else {
        // Immediate navigation without animation
        navigate(path);
        
        setState(prev => {
          const newHistory = [...prev.navigationHistory];
          if (newHistory[newHistory.length - 1] !== path) {
            newHistory.push(path);
          
          return {
            ...prev,
            navigationHistory: newHistory,
            canGoBack: newHistory.length > 1,
            canGoForward: false
          };
        });
    },

    goBack: () => {
      setState(prev => {
        if (prev.canGoBack && prev.navigationHistory.length > 1) {
          const newHistory = [...prev.navigationHistory];
          const currentIndex = newHistory.length - 1;
          const previousPath = newHistory[currentIndex - 1];
          
          navigate(previousPath);
          
          return {
            ...prev,
            canGoBack: currentIndex > 1,
            canGoForward: true
          };
        return prev;
      });
    },

    goForward: () => {
      // This would require more complex history management
      // For now, we'll keep it simple
      window.history.forward();
    },

    toggleSidebar: () => {
      setState(prev => ({
        ...prev,
        sidebarCollapsed: !prev.sidebarCollapsed
      }));
    },

    setSidebarCollapsed: (collapsed: boolean) => {
      setState(prev => ({
        ...prev,
        sidebarCollapsed: collapsed
      }));
    },

    toggleMobileMenu: () => {
      setState(prev => ({
        ...prev,
        mobileMenuOpen: !prev.mobileMenuOpen
      }));
    },

    setMobileMenuOpen: (open: boolean) => {
      setState(prev => ({
        ...prev,
        mobileMenuOpen: open
      }));
    },

    setActiveItem: (itemId: string) => {
      setState(prev => ({
        ...prev,
        activeItems: new Set([itemId])
      }));
    },

    setActiveItems: (itemIds: string[]) => {
      setState(prev => ({
        ...prev,
        activeItems: new Set(itemIds)
      }));
    },

    addActiveItem: (itemId: string) => {
      setState(prev => ({
        ...prev,
        activeItems: new Set([...prev.activeItems, itemId])
      }));
    },

    removeActiveItem: (itemId: string) => {
      setState(prev => {
        const newActiveItems = new Set(prev.activeItems);
        newActiveItems.delete(itemId);
        return {
          ...prev,
          activeItems: newActiveItems
        };
      });
    },

    updateNavigationItems: (items: NavigationItem[]) => {
      setState(prev => ({
        ...prev,
        navigationItems: items
      }));
    },

    updateItemBadge: (itemId: string, badge?: string | number) => {
      setState(prev => ({
        ...prev,
        navigationItems: prev.navigationItems.map(item => 
          item.id === itemId 
            ? { ...item, badge
            : {
                ...item,
                children: item.children?.map(child =>
                  child.id === itemId ? { ...child, badge } : child
                )
        )
      }));
    },

    // Active indicator management
    setActiveIndicatorStyle: (style: 'line' | 'dot' | 'background' | 'border') => {
      setState(prev => ({
        ...prev,
        activeIndicators: {
          ...prev.activeIndicators,
          indicatorStyle: style
      }));
    },

    setActiveIndicatorPosition: (position: 'left' | 'right' | 'top' | 'bottom') => {
      setState(prev => ({
        ...prev,
        activeIndicators: {
          ...prev.activeIndicators,
          indicatorPosition: position
      }));
    },

    toggleActiveIndicator: (show: boolean) => {
      setState(prev => ({
        ...prev,
        activeIndicators: {
          ...prev.activeIndicators,
          showActiveIndicator: show
      }));
    },

    setAnimateTransitions: (animate: boolean) => {
      setState(prev => ({
        ...prev,
        activeIndicators: {
          ...prev.activeIndicators,
          animateTransitions: animate
      }));
    },

    // Transition management
    startTransition: (direction: 'forward' | 'backward', duration?: number) => {
      setState(prev => ({
        ...prev,
        isTransitioning: true,
        transitionDirection: direction,
        transitionDuration: duration || prev.transitionDuration
      }));
    },

    endTransition: () => {
      setState(prev => ({
        ...prev,
        isTransitioning: false,
        transitionDirection: 'none',
        pendingNavigation: null
      }));
    },

    setTransitionDuration: (duration: number) => {
      setState(prev => ({
        ...prev,
        transitionDuration: Math.max(100, Math.min(1000, duration)) // Clamp between 100ms and 1s
      }));
    },

    setTransitionEasing: (easing: 'ease-in-out' | 'ease-in' | 'ease-out' | 'linear') => {
      setState(prev => ({
        ...prev,
        transitionEasing: easing
      }));
  };

  const contextValue: NavigationContextType = {
    state,
    actions
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
};

export default NavigationContext;
}}}}}}}}}}}}}}}}}}}}}}}}