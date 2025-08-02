// Service Worker Registration and Management
// Handles PWA service worker registration, updates, and offline capabilities

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
  onError?: (error: Error) => void;
}

// Register service worker
export function registerSW(config?: ServiceWorkerConfig) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
            'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('SW registered: ', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
              
              if (config && config.onOfflineReady) {
                config.onOfflineReady();
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
      if (config && config.onError) {
        config.onError(error);
      }
    });
}

function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

// Unregister service worker
export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('Service worker unregistered');
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Update service worker
export function updateSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.update();
        console.log('Service worker update requested');
      })
      .catch((error) => {
        console.error('Service worker update failed:', error);
      });
  }
}

// Check if app is running in standalone mode (installed as PWA)
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// Check if service worker is supported
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

// Get service worker registration
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      return await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Failed to get service worker registration:', error);
      return null;
    }
  }
  return null;
}

// Send message to service worker
export function sendMessageToSW(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('No service worker controller available'));
      return;
    }

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
}

// Listen for service worker updates
export function listenForSWUpdates(callback: (hasUpdate: boolean) => void) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      callback(true);
    });
  }
}

// Cache management utilities
export class CacheManager {
  static async clearAllCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  static async getCacheSize(): Promise<number> {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }

  static async getCacheNames(): Promise<string[]> {
    if ('caches' in window) {
      return await caches.keys();
    }
    return [];
  }
}

// Offline detection utilities
export class OfflineManager {
  private static listeners: Array<(isOnline: boolean) => void> = [];

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static addListener(callback: (isOnline: boolean) => void): void {
    this.listeners.push(callback);
    
    // Add event listeners if this is the first listener
    if (this.listeners.length === 1) {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  static removeListener(callback: (isOnline: boolean) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }

    // Remove event listeners if no more listeners
    if (this.listeners.length === 0) {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  private static handleOnline = (): void => {
    this.listeners.forEach(callback => callback(true));
  };

  private static handleOffline = (): void => {
    this.listeners.forEach(callback => callback(false));
  };
}

// Background sync utilities
export class BackgroundSync {
  static async registerSync(tag: string): Promise<void> {
    const registration = await getServiceWorkerRegistration();
    if (registration && 'sync' in registration) {
      try {
        await (registration as any).sync.register(tag);
        console.log(`Background sync registered: ${tag}`);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  static async storePendingRequest(tag: string, data: any): Promise<void> {
    // Store in IndexedDB or localStorage for background sync
    const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
    pendingRequests.push({ tag, data, timestamp: Date.now() });
    localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
  }
}

export default {
  registerSW,
  unregisterSW,
  updateSW,
  isStandalone,
  isServiceWorkerSupported,
  getServiceWorkerRegistration,
  sendMessageToSW,
  listenForSWUpdates,
  CacheManager,
  OfflineManager,
  BackgroundSync
};