// E-Raksha Service Worker - Offline Emergency App Support
const CACHE_NAME = 'eraksha-v1.0.0';
const STATIC_CACHE = 'eraksha-static-v1.0.0';
const DYNAMIC_CACHE = 'eraksha-dynamic-v1.0.0';

// Core files that must be cached for offline functionality
const CORE_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Optional files to cache when available
const OPTIONAL_FILES = [
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-384x384.png'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching core files...');
        return cache.addAll(CORE_FILES);
      })
      .then(() => {
        console.log('✅ Core files cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('❌ Failed to cache core files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('📱 Serving from cache:', request.url);
          return cachedResponse;
        }
        
        // Fetch from network and cache dynamic content
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache if not successful
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Cache dynamic content
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            console.log('🌐 Serving from network:', request.url);
            return networkResponse;
          })
          .catch((error) => {
            console.log('❌ Network request failed:', request.url, error);
            
            // Return offline fallback for HTML pages
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // Return empty response for other resources
            return new Response('', {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for emergency events
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-sync') {
    console.log('🔄 Background sync: emergency data');
    event.waitUntil(syncEmergencyData());
  }
});

// Push notifications for emergency alerts
self.addEventListener('push', (event) => {
  console.log('📧 Push notification received');
  
  let notificationData = {};
  
  if (event.data) {
    notificationData = event.data.json();
  }
  
  const options = {
    body: notificationData.body || 'Emergency alert from E-Raksha',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200, 100, 400],
    data: notificationData.data || {},
    actions: [
      {
        action: 'call',
        title: 'Call Emergency',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-96x96.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'E-Raksha Emergency Alert',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'call') {
    // Open app and trigger emergency call
    event.waitUntil(
      clients.openWindow('/?action=emergency')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Message handling from main app
self.addEventListener('message', (event) => {
  console.log('📨 Message received:', event.data);
  
  if (event.data && event.data.type === 'CACHE_EMERGENCY_DATA') {
    // Cache emergency event data for offline access
    cacheEmergencyData(event.data.payload);
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper functions
async function syncEmergencyData() {
  try {
    // Sync any pending emergency data to server
    const emergencyData = await getStoredEmergencyData();
    if (emergencyData.length > 0) {
      // Send to server in production
      console.log('📊 Syncing emergency data:', emergencyData);
    }
  } catch (error) {
    console.error('❌ Failed to sync emergency data:', error);
  }
}

async function getStoredEmergencyData() {
  // In a real app, this would read from IndexedDB or similar
  return [];
}

async function cacheEmergencyData(data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put('/emergency-data', response);
    console.log('💾 Emergency data cached');
  } catch (error) {
    console.error('❌ Failed to cache emergency data:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'emergency-check') {
    event.waitUntil(checkEmergencyStatus());
  }
});

async function checkEmergencyStatus() {
  // Check for any emergency status updates
  console.log('🔍 Checking emergency status...');
}

console.log('🔧 E-Raksha Service Worker loaded');
