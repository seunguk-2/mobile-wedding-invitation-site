const CACHE_NAME = "wedding-invitation-v5";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./editor.html",
  "./styles.css",
  "./editor.css",
  "./data.js",
  "./app.js",
  "./editor.js",
  "./content.json",
  "./manifest.webmanifest",
  "./assets/icon.svg",
];

function isCacheableResponse(response) {
  return Boolean(response) && response.status === 200 && response.type === "basic";
}

function buildCacheKey(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/content.json") || url.pathname.includes("/uploads/")) {
    return `${url.origin}${url.pathname}`;
  }
  return request;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cacheKey = buildCacheKey(request);

  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      cache.put(cacheKey, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cacheKey = buildCacheKey(request);
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (isCacheableResponse(response)) {
    cache.put(cacheKey, response.clone());
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isContentRequest = url.pathname.endsWith("/content.json");
  const isUploadRequest = url.pathname.includes("/uploads/");
  const isEditorRequest =
    url.pathname.endsWith("/editor.html") ||
    url.pathname.endsWith("/editor.js") ||
    url.pathname.endsWith("/editor.css");

  if (isContentRequest || isUploadRequest || isEditorRequest) {
    event.respondWith(
      networkFirst(event.request).catch(async () => {
        const cached = await caches.match(buildCacheKey(event.request));
        return cached || Response.error();
      }),
    );
    return;
  }

  event.respondWith(
    cacheFirst(event.request).catch(async () => {
      if (event.request.mode === "navigate") {
        const cachedIndex = await caches.match("./index.html");
        return cachedIndex || Response.error();
      }
      return Response.error();
    }),
  );
});
