/**
 * Tier 6 zad. 298 — Service Worker (offline cache).
 *
 * Strategia:
 *   - precache: shell (/, /app, /baza-wiedzy, /offline.html)
 *   - runtime cache (stale-while-revalidate) — /baza-wiedzy/* artykuły
 *   - runtime cache (cache-first) — fonts, /icons/*, /_next/static/*
 *   - network-only — /api/*, /auth/*, /app/* (private)
 *   - fallback offline.html dla nawigacji gdy offline
 *
 * Wersjonowanie: zmiana CACHE_VERSION wymusza re-fetch shell'a.
 */

const CACHE_VERSION = "v1-2026-05-11";
const SHELL_CACHE = `dlugomat-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `dlugomat-runtime-${CACHE_VERSION}`;
const STATIC_CACHE = `dlugomat-static-${CACHE_VERSION}`;

const SHELL_URLS = [
  "/",
  "/offline.html",
  "/baza-wiedzy",
  "/cennik",
  "/jak-to-dziala",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.endsWith(CACHE_VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".webp")
  );
}

function isKnowledgeArticle(url) {
  return (
    url.pathname.startsWith("/baza-wiedzy/") &&
    !url.pathname.startsWith("/baza-wiedzy/api")
  );
}

function isPrivateOrApi(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/app/") ||
    url.pathname.startsWith("/admin/")
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-only dla API/auth/app
  if (isPrivateOrApi(url)) return;

  // Cache-first dla statycznych assets
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((resp) => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
          }
          return resp;
        });
      }),
    );
    return;
  }

  // Stale-while-revalidate dla artykułów
  if (isKnowledgeArticle(url) || SHELL_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((resp) => {
            if (resp.ok) {
              const clone = resp.clone();
              caches
                .open(RUNTIME_CACHE)
                .then((c) => c.put(req, clone))
                .catch(() => {});
            }
            return resp;
          })
          .catch(() => cached || caches.match("/offline.html"));
        return cached || fetchPromise;
      }),
    );
    return;
  }

  // Navigation fallback — offline.html gdy brak sieci
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match("/offline.html").then((r) => r || new Response("Offline", {
          status: 503,
          headers: { "content-type": "text/plain" },
        })),
      ),
    );
  }
});

// Tier 6 zad. 299 — Background Sync (queued POSTs)
self.addEventListener("sync", (event) => {
  if (event.tag === "dlugomat-pending-events") {
    event.waitUntil(flushPendingEvents());
  }
});

async function flushPendingEvents() {
  try {
    const cache = await caches.open("dlugomat-pending");
    const requests = await cache.keys();
    for (const req of requests) {
      try {
        const resp = await fetch(req);
        if (resp.ok) await cache.delete(req);
      } catch {
        // pozostawiamy w cache do następnego sync
      }
    }
  } catch {
    // ignore
  }
}
