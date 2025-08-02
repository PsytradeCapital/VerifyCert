import { useState, useEffect, useCallback } from 'react';
import { 
  registerSW, 
  updateSW, 
  isServiceWorkerSupported, 
  isStandalone,
  OfflineManager,
  CacheManager
} from '../utils/serviceWorker';
import { 
  getDeviceInfo, 
  shouldShowInstallPrompt, 
  trackInstallPromptEvent,
  getPWAStatus 
} from '../utils/pwaUtils';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalled: boolean;
  hasUpdate: boolean;
  isOffline: boolean;
  isStandalone: boolean;
  cacheSize: number;
  error: string | null;
}

interface ServiceWorkerActions {
  register: () => void;
  update: () => void;
  clearCache: () => Promise<void>;
  refreshCacheSize: () => Promise<void>;
}

export function useServiceWorker(): [ServiceWorkerState, ServiceWorkerActions] {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: isServiceWorkerSupported(),
    isRegistered: false,
    isInstalled: false,
    hasUpdate: false,
    isOffline: !navigator.onLine,
    isStandalone: isStandalone(),
    cacheSize: 0,
    error: null
  });

  // Register service worker
  const register = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Service Worker is not supported in this browser' 
      }));
      return;
    }

    registerSW({
      onSuccess: (registration) => {
        console.log('SW registered successfully:', registration);
        setState(prev => ({ 
          ...prev, 
          isRegistered: true, 
          isInstalled: true,
          error: null 
        }));
      },
      onUpdate: (registration) => {
        console.log('SW update available:', registration);
        setState(prev => ({ 
          ...prev, 
          hasUpdate: true,
          error: null 
        }));
      },
      onOfflineReady: () => {
        console.log('App is ready for offline use');
        setState(prev => ({ 
          ...prev, 
          isInstalled: true,
          error: null 
        }));
      },
      onError: (error) => {
        console.error('SW registration failed:', error);
        setState(prev => ({ 
          ...prev, 
          error: error.message 
        }));
      }
    });
  }, [state.isSupported]);

  // Update service worker
  const update = useCallback(() => {
    updateSW();
    setState(prev => ({ ...prev, hasUpdate: false }));
  }, []);

  // Clear all caches
  const clearCache = useCallback(async () => {
    try {
      await CacheManager.clearAllCaches();
      await refreshCacheSize();
      console.log('All caches cleared successfully');
    } catch (error) {
      console.error('Failed to clear caches:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to clear caches' 
      }));
    }
  }, []);

  // Refresh cache size
  const refreshCacheSize = useCallback(async () => {
    try {
      const size = await CacheManager.getCacheSize();
      setState(prev => ({ ...prev, cacheSize: size }));
    } catch (error) {
      console.error('Failed to get cache size:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  // Set up offline/online listeners
  useEffect(() => {
    const handleOnlineStatus = (isOnline: boolean) => {
      setState(prev => ({ ...prev, isOffline: !isOnline }));
    };

    OfflineManager.addListener(handleOnlineStatus);

    return () => {
      OfflineManager.removeListener(handleOnlineStatus);
    };
  }, []);

  // Initial cache size calculation
  useEffect(() => {
    refreshCacheSize();
  }, [refreshCacheSize]);

  // Auto-register service worker on mount
  useEffect(() => {
    if (state.isSupported && !state.isRegistered) {
      register();
    }
  }, [state.isSupported, state.isRegistered, register]);

  const actions: ServiceWorkerActions = {
    register,
    update,
    clearCache,
    refreshCacheSize
  };

  return [state, actions];
}

// Hook for offline status only
export function useOfflineStatus(): boolean {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnlineStatus = (isOnline: boolean) => {
      setIsOffline(!isOnline);
    };

    OfflineManager.addListener(handleOnlineStatus);

    return () => {
      OfflineManager.removeListener(handleOnlineStatus);
    };
  }, []);

  return isOffline;
}

// Hook for PWA installation status
export function usePWAInstallation() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isStandalone());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installationState, setInstallationState] = useState<'idle' | 'prompted' | 'installing' | 'installed' | 'failed'>('idle');

  // Get device information
  const deviceInfo = getDeviceInfo();
  const pwaStatus = getPWAStatus();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Check if we should show the prompt
      if (shouldShowInstallPrompt()) {
        setCanInstall(true);
        setInstallationState('prompted');
        trackInstallPromptEvent('prompt_available');
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      setInstallationState('installed');
      trackInstallPromptEvent('install_success');
    };

    // Handle visibility change to detect if user switched to home screen (iOS)
    const handleVisibilityChange = () => {
      if (document.hidden && deviceInfo.isIOSSafari && installationState === 'installing') {
        // User might have added to home screen on iOS
        setTimeout(() => {
          if (isStandalone()) {
            setIsInstalled(true);
            setInstallationState('installed');
            trackInstallPromptEvent('install_success', { method: 'ios_manual' });
          }
        }, 1000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check if already installed on mount
    if (pwaStatus.isInstalled) {
      setIsInstalled(true);
      setInstallationState('installed');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [deviceInfo.isIOSSafari, installationState, pwaStatus.isInstalled]);

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      // Handle iOS Safari special case
      if (deviceInfo.isIOSSafari) {
        setInstallationState('installing');
        trackInstallPromptEvent('install_attempt', { method: 'ios_manual' });
        // iOS Safari doesn't support beforeinstallprompt
        // User needs to manually add to home screen
        return false;
      }
      return false;
    }

    setInstallationState('installing');
    trackInstallPromptEvent('install_attempt', { method: 'automatic' });

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setInstallationState('installed');
        trackInstallPromptEvent('install_accepted');
      } else {
        console.log('User dismissed the install prompt');
        setInstallationState('idle');
        trackInstallPromptEvent('install_declined');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setCanInstall(false);

      return outcome === 'accepted';
    } catch (error) {
      console.error('Installation failed:', error);
      setInstallationState('failed');
      trackInstallPromptEvent('install_error', { error: error.message });
      return false;
    }
  }, [deferredPrompt, deviceInfo.isIOSSafari]);

  // Function to show iOS installation instructions
  const showIOSInstructions = useCallback(() => {
    return deviceInfo.isIOSSafari && !isInstalled && shouldShowInstallPrompt();
  }, [deviceInfo.isIOSSafari, isInstalled]);

  return {
    canInstall,
    isInstalled,
    installPWA,
    installationState,
    isMobile: deviceInfo.isMobile,
    isIOSSafari: deviceInfo.isIOSSafari,
    showIOSInstructions: showIOSInstructions(),
    deviceInfo,
    pwaStatus
  };
}

export default useServiceWorker;