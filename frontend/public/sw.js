// Service Worker for VerifyCert PWA
// Provides caching and offline support

const CACHE_NAME = 'verifycert-v1';
const STATIC_CACHE_NAME = 'verifycert-static-v1';
const DYNAMIC_CACHE_NAME = 'verifycert-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
  '/offline.html'
];

// Routes to cache dynamically
const CACHEABLE_ROUTES = [
  '/',
  '/verify',
  '/dashboard',
  '/certificate',
  '/layout-demo',
  '/breadcrumbs-demo',
  '/navigation-demo'
];

// Network-first resources (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /blockchain/,
  /ethers/,
  /\.json$/
];

// Cache-first resources (serve from cache if available)
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:css|js)$/,
  /fonts/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request, url));
});

// Handle different types of requests with appropriate caching strategies
async function handleRequest(request, url) {
  try {
    // Network-first strategy for API calls and dynamic content
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await cacheFirst(request);
    }
    
    // Stale-while-revalidate for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
      return await staleWhileRevalidate(request);
    }
    
    // Default to network-first for everything else
    return await networkFirst(request);
    
  } catch (error) {
    console.error('[SW] Request handling failed:', error);
    return await handleOfflineFallback(request);
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed for:', request.url);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[SW] Network update failed:', error);
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Handle offline fallback
async function handleOfflineFallback(request) {
  // For HTML requests, return cached offline page or index.html
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    const cachedResponse = await caches.match('/') || 
                          await caches.match('/index.html');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a basic offline response as fallback
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>VerifyCert - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
              background: #f9fafb;
              color: #374151;
            }
            .offline-container {
              text-align: center;
              padding: 2rem;
              max-width: 400px;
            }
            .offline-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 { color: #1f2937; margin-bottom: 0.5rem; }
            p { color: #6b7280; line-height: 1.5; }
            .retry-btn {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              margin-top: 1rem;
              font-size: 1rem;
            }
            .retry-btn:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1>You're Offline</h1>
            <p>VerifyCert is not available right now. Please check your internet connection and try again.</p>
            <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
  
  // For other requests, return a network error
  return new Response('Network Error', {
    status: 408,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Background sync for certificate verification
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'certificate-verification') {
    event.waitUntil(handleCertificateVerificationSync());
  }
});

// Handle background certificate verification
async function handleCertificateVerificationSync() {
  try {
    // Get pending verifications from IndexedDB or localStorage
    const pendingVerifications = await getPendingVerifications();
    
    for (const verification of pendingVerifications) {
      try {
        await processCertificateVerification(verification);
        await removePendingVerification(verification.id);
      } catch (error) {
        console.error('[SW] Failed to process verification:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Placeholder functions for background sync (to be implemented with IndexedDB)
async function getPendingVerifications() {
  // TODO: Implement with IndexedDB
  return [];
}

async function processCertificateVerification(verification) {
  // TODO: Implement certificate verification logic
  console.log('[SW] Processing verification:', verification);
}

async function removePendingVerification(id) {
  // TODO: Implement with IndexedDB
  console.log('[SW] Removing pending verification:', id);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'VerifyCert',
    body: 'You have new certificate updates',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'default',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/dashboard'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-192.png'
      }
    ]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }

  // Add vibration pattern
  if (!notificationData.vibrate) {
    notificationData.vibrate = [100, 50, 100];
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: notificationData.vibrate,
      requireInteraction: false,
      silent: false
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action, event.notification.data);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  // Handle different actions
  let targetUrl = '/';
  
  switch (action) {
    case 'view':
      targetUrl = data.url || '/dashboard';
      break;
    case 'share':
      if (data.certificateId) {
        targetUrl = `/certificate/${data.certificateId}/share`;
      } else {
        targetUrl = data.url || '/dashboard';
      }
      break;
    case 'contact':
      targetUrl = '/support';
      break;
    case 'dismiss':
      // Just close the notification, don't open anything
      return;
    default:
      // Default action (clicking notification body)
      targetUrl = data.url || '/dashboard';
  }
  
  // Open the target URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === new URL(targetUrl, self.location.origin).href && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  
  // Track notification dismissal analytics if needed
  const data = event.notification.data || {};
  
  if (data.type) {
    console.log(`[SW] Notification of type "${data.type}" was dismissed`);
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service worker script loaded');