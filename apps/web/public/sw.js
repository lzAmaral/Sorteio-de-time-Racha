/**
 * Service worker do Sorteio do Racha — escrito à mão, de propósito.
 *
 * O app é uma única rota estática, 100% client-side e sem backend (ADR-0002),
 * então não precisa de nada do tamanho do `next-pwa`: bastam duas estratégias.
 *
 *   - Navegações (o HTML): network-first com fallback para o cache. Online o
 *     usuário sempre recebe a versão nova; no avião, abre do cache.
 *   - Assets (`/_next/static`, ícones, fontes): cache-first com revalidação em
 *     segundo plano (stale-while-revalidate). Resposta instantânea no 4G ruim
 *     da beira da quadra, e a próxima visita já pega a versão atualizada.
 *
 * Contra o clássico "o SW travou a versão velha pra sempre": o nome do cache é
 * versionado (CACHE_VERSION), o `activate` apaga todo cache de versão anterior
 * e usamos `skipWaiting` + `clients.claim`. Ao publicar uma mudança no próprio
 * SW, suba o CACHE_VERSION.
 */

const CACHE_VERSION = "v1";
const SHELL_CACHE = `racha-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `racha-assets-${CACHE_VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE];

/** Mínimo para o app abrir offline; o resto (chunks do Next) entra em runtime. */
const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const OFFLINE_FALLBACK = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Tolerante a falha: um ícone indisponível não pode derrubar a instalação.
      await Promise.allSettled(
        SHELL_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("racha-") && !CURRENT_CACHES.includes(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

function isAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:css|js|woff2?|png|svg|jpg|jpeg|webp|ico)$/.test(url.pathname)
  );
}

/** Rede primeiro; se falhar (offline), devolve o que estiver em cache. */
async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await cache.match(OFFLINE_FALLBACK);
    if (fallback) return fallback;
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Sem conexão</title><p>Sem conexão e sem versão em cache. Abra o app uma vez online para usá-lo offline.",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

/** Cache primeiro; atualiza em segundo plano para a próxima visita. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;
  const response = await network;
  if (response) return response;
  return new Response("", { status: 504, statusText: "Offline" });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
