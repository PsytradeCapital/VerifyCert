import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationSyncOptions {
  syncWithBrowser?: boolean;
  trackHistory?: boolean;
  enableKeyboardShortcuts?: boolean;
}

export const useNavigationSync = (options: NavigationSyncOptions = {}) => {
  const { syncWithBrowser = true, trackHistory = true, enableKeyboardShortcuts = true } = options;
  const location = useLocation();
  const navigate = useNavigate();

  // Sync with browser navigation
  useEffect(() => {
    if (!syncWithBrowser) return;

    const handlePopState = (event: PopStateEvent) => {
      // Handle browser back/forward navigation
      if (event.state && event.state.path) {
        navigate(event.state.path, { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncWithBrowser, navigate]);

  // Track navigation history
  useEffect(() => {
    if (!trackHistory) return;

    // Store current path in session storage
    const navigationHistory = JSON.parse(
      sessionStorage.getItem('navigationHistory') || '[]'
    );
    
    navigationHistory.push({
      path: location.pathname,
      timestamp: Date.now(),
      search: location.search,
      hash: location.hash
    });

    // Keep only last 50 entries
    if (navigationHistory.length > 50) {
      navigationHistory.shift();
    }

    sessionStorage.setItem('navigationHistory', JSON.stringify(navigationHistory));
  }, [location, trackHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + Left Arrow: Go back
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        window.history.back();
      }
      
      // Alt + Right Arrow: Go forward
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        window.history.forward();
      }
      
      // Ctrl/Cmd + Home: Go to home
      if ((event.ctrlKey || event.metaKey) && event.key === 'Home') {
        event.preventDefault();
        navigate('/');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, navigate]);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goForward = useCallback(() => {
    window.history.forward();
  }, []);

  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const getNavigationHistory = useCallback(() => {
    return JSON.parse(sessionStorage.getItem('navigationHistory') || '[]');
  }, []);

  const clearNavigationHistory = useCallback(() => {
    sessionStorage.removeItem('navigationHistory');
  }, []);

  return {
    currentPath: location.pathname,
    goBack,
    goForward,
    goHome,
    getNavigationHistory,
    clearNavigationHistory
  };
};

export default useNavigationSync;