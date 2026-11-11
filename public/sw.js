/*
 * Static fallback service worker for hosts that omit Workbox's generated sw.js.
 * Workbox can replace this file during the production build; both workers use
 * the same root URL and provide offline navigation/static-asset caching.
 */
const CACHE_PREFIX = "mizan-offline-";
const CACHE_NAME = `${CACHE_PREFIX}shell-v1`;
const APP_ROOT = new URL("./", self.registration.scope).href;
const OFFLINE_ASSETS = [
  APP_ROOT,
  new URL("manifest.json", APP_ROOT).href,
  new URL("icon-192.png", APP_ROOT).href,
  new URL("icon-512.png", APP_ROOT).href,
];

function isSameOrigin(url) {
  try {
    return new URL(url, self.location.href).origin === self.location.origin;
  } catch {
    return false;
  }
}

async function warmAppShell(cache) {
  const pageResponse = await fetch(new Request(APP_ROOT, { cache: "reload" }));
  if (!pageResponse.ok) throw new Error(`Unable to cache app shell: ${pageResponse.status}`);
  await cache.put(APP_ROOT, pageResponse.clone());

  const html = await pageResponse.text();
  const urls = new Set(OFFLINE_ASSETS);
  const assetPattern = /(?:src|href)=["']([^"']+)["']/gi;
  let match;
  while ((match = assetPattern.exec(html))) {
    if (isSameOrigin(match[1])) urls.add(new URL(match[1], APP_ROOT).href);
  }

  await Promise.all([...urls].map(async (url) => {
    if (url === APP_ROOT) return;
    try {
      const response = await fetch(new Request(url, { cache: "reload" }));
      if (response.ok && response.type !== "opaque") await cache.put(url, response);
    } catch (error) {
      console.warn("[Mizan SW] Could not precache optional app asset", url, error);
    }
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await warmAppShell(cache);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || !isSameOrigin(request.url)) return;

  const url = new URL(request.url);
  const isNavigation = request.mode === "navigate";
  const isStaticAsset = ["script", "style", "font", "image"].includes(request.destination);

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
          if (url.pathname === new URL(APP_ROOT).pathname) await cache.put(APP_ROOT, response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request)) || (await cache.match(APP_ROOT)) || Response.error();
      }
    })());
    return;
  }

  if (isStaticAsset || url.pathname === new URL(APP_ROOT).pathname || url.pathname === new URL("manifest.json", APP_ROOT).pathname) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      const network = fetch(request).then((response) => {
        if (response.ok) void cache.put(request, response.clone());
        return response;
      });
      if (cached) {
        event.waitUntil(network.catch(() => undefined));
        return cached;
      }
      try {
        return await network;
      } catch {
        return Response.error();
      }
    })());
  }
});
