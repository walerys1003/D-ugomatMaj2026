// Service worker source as a string — emitted to /public/sw.js by a script,
// or served dynamically via app/sw.ts route. Strategies:
// - precache: app shell (/, /offline, manifest, fonts)
// - runtime: NetworkFirst for /api/*, StaleWhileRevalidate for static assets
// - offline fallback: /offline page if no cache match for navigation requests.

export const SW_VERSION = "v1.0.0";

export const SW_SOURCE = `// Długomat Service Worker ${SW_VERSION}
// Auto-generated — do not edit directly; modify service-worker-template.ts.

const VERSION = "${SW_VERSION}";
const PRECACHE = "dlugomat-precache-" + VERSION;
const RUNTIME = "dlugomat-runtime-" + VERSION;
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("dlugomat-") && k !== PRECACHE && k !== RUNTIME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// NetworkFirst for API, SWR for static, offline fallback for nav.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Don't touch cross-origin
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(req));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(navHandler(req));
    return;
  }

  // static assets
  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(RUNTIME);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function navHandler(req) {
  try {
    return await fetch(req);
  } catch (e) {
    const cache = await caches.open(PRECACHE);
    return (await cache.match("/offline")) || new Response("Offline", { status: 503 });
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try { payload = event.data.json(); } catch { payload = { title: "Długomat", body: event.data.text() }; }
  const title = payload.title || "Długomat";
  const options = {
    body: payload.body,
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/badge-72.png",
    data: payload.data || {},
    tag: payload.tag,
    requireInteraction: payload.requireInteraction || false,
    actions: payload.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes(targetUrl) && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Background sync — drain offline queue when connectivity returns.
self.addEventListener("sync", (event) => {
  if (event.tag === "dlugomat-offline-queue") {
    event.waitUntil(fetch("/api/offline-queue/drain", { method: "POST" }).catch(() => null));
  }
});
`;
