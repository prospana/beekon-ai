// Enhanced Service Worker with intelligent caching strategies
const CACHE_NAME = 'beekon-ai-v2.0.0';
const STATIC_CACHE = 'beekon-static-v2.0.0';
const API_CACHE = 'beekon-api-v2.0.0';
const IMAGE_CACHE = 'beekon-images-v2.0.0';

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  // Static assets - cache first with long TTL
  static: {
    strategy: 'CacheFirst',
    cacheName: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100,
  },
  // API responses - network first with fallback
  api: {
    strategy: 'NetworkFirst',
    cacheName: API_CACHE,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 200,
  },
  // Images - cache first with compression
  images: {
    strategy: 'CacheFirst',
    cacheName: IMAGE_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 50,
  },
};

// Critical resources to precache
const PRECACHE_RESOURCES = [
  '/',
  '/dashboard',
  '/static/js/vendor.js',
  '/static/js/react-core.js',
  '/static/css/main.css',
  '/manifest.json',
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  { pattern: /\/api\/workspaces/, strategy: 'NetworkFirst', maxAge: 10 * 60 * 1000 },
  { pattern: /\/api\/websites/, strategy: 'NetworkFirst', maxAge: 5 * 60 * 1000 },
  { pattern: /\/api\/dashboard\/metrics/, strategy: 'StaleWhileRevalidate', maxAge: 2 * 60 * 1000 },
  { pattern: /\/api\/competitors/, strategy: 'NetworkFirst', maxAge: 5 * 60 * 1000 },
  { pattern: /\/api\/analysis/, strategy: 'NetworkFirst', maxAge: 10 * 60 * 1000 },
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Precache critical resources
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(PRECACHE_RESOURCES);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      // Claim all clients immediately
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;
  
  // Route to appropriate cache strategy
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-api') {
    event.waitUntil(syncPendingRequests());
  }
});

// Push notifications for real-time updates
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: data.url,
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    );
  }
});

// Cache strategy implementations
async function handleStaticAsset(request: Request): Promise<Response> {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, CACHE_STRATEGIES.static.maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function handleAPIRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const cachePattern = API_CACHE_PATTERNS.find(p => p.pattern.test(url.pathname));
  
  if (!cachePattern) {
    return fetch(request);
  }
  
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  switch (cachePattern.strategy) {
    case 'NetworkFirst':
      return handleNetworkFirst(request, cache, cachePattern.maxAge);
    case 'StaleWhileRevalidate':
      return handleStaleWhileRevalidate(request, cache, cachePattern.maxAge);
    default:
      return fetch(request);
  }
}

async function handleNetworkFirst(request: Request, cache: Cache, maxAge: number): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      // Add timestamp for expiration
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers,
      });
      
      cache.put(request, modifiedResponse);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
      return cachedResponse;
    }
    throw error;
  }
}

async function handleStaleWhileRevalidate(request: Request, cache: Cache, maxAge: number): Promise<Response> {
  const cachedResponse = await cache.match(request);
  
  // Always try to update in background
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      
      cache.put(request, modifiedResponse.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached if available and not expired, otherwise wait for network
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }
  
  return networkPromise || new Response('Offline', { status: 503 });
}

async function handleImageRequest(request: Request): Promise<Response> {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder image for failed image requests
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#999">Image unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

async function handleNavigationRequest(request: Request): Promise<Response> {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Return cached index.html for navigation requests (SPA fallback)
    const cachedResponse = await cache.match('/');
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Utility functions
function isStaticAsset(url: URL): boolean {
  return /\.(js|css|woff2?|ttf|eot)$/i.test(url.pathname);
}

function isAPIRequest(url: URL): boolean {
  return url.pathname.startsWith('/api/') || url.hostname.includes('supabase');
}

function isImageRequest(url: URL): boolean {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif)$/i.test(url.pathname);
}

function isExpired(response: Response, maxAge: number): boolean {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true;
  
  return Date.now() - parseInt(cachedAt) > maxAge;
}

async function cleanupOldCaches(): Promise<void> {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name !== CACHE_NAME && 
    name !== STATIC_CACHE && 
    name !== API_CACHE && 
    name !== IMAGE_CACHE
  );
  
  await Promise.all(oldCaches.map(name => caches.delete(name)));
}

async function syncPendingRequests(): Promise<void> {
  // Handle offline requests that were queued
  const cache = await caches.open('pending-requests');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.log('Failed to sync request:', request.url);
    }
  }
}

export {};
