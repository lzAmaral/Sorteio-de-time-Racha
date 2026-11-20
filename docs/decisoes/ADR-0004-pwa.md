# ADR-0004 — PWA com service worker manual (sem `next-pwa`)

- **Status:** aceita (20/11/2026)
- **Contexto:** o organizador usa o app na beira da quadra com 4G ruim e precisa que ele
  abra mesmo sem rede ("funciona na beira do campo"). O app é uma única rota estática,
  100% client-side e sem backend ([ADR-0002](ADR-0002-local-first.md)) — o estado já mora
  em `localStorage`, então não há dados a sincronizar. A opção óbvia seria `next-pwa`,
  mas ela traz Workbox, um plugin de build e um runtime caching configurável que este
  app não usa; em troca pede acoplamento ao ciclo de releases do Next.
- **Decisão:**
  - **Manifest pela convenção do App Router** (`app/manifest.ts` → `/manifest.webmanifest`),
    para o manifest ser tipado e versionado como código.
  - **Service worker escrito à mão** em `apps/web/public/sw.js` (~100 linhas, zero
    dependências), registrado por um client component mínimo
    (`components/service-worker-registration.tsx`) montado no layout:
    - navegações → **network-first** com fallback para o cache (online sempre pega a
      versão nova; offline abre do cache);
    - assets (`/_next/static`, ícones, fontes) → **cache-first com revalidação em
      segundo plano**, já que os nomes são hasheados pelo Next;
    - `skipWaiting` + `clients.claim`, nome de cache versionado (`racha-*-v1`) e limpeza
      dos caches antigos no `activate` — o antídoto para "o SW travou a versão velha".
  - **Ícones gerados por script Node sem dependências** (`scripts/generate-icons.mjs`,
    `npm run icons`): rasteriza o logo mark (camisa `Shirt` do lucide, a mesma do header,
    sobre quadrado preto arredondado) em PNG 192/512 + variante *maskable* + apple-touch-icon.
    Os PNGs são versionados, então build e runtime não dependem do script.
- **Gatilho de reversão:** se o app ganhar várias rotas, conteúdo dinâmico ou precisar de
  background sync/push (Fase 2+), migrar para Workbox/`next-pwa` em vez de aumentar o SW
  manual.
- **Consequências:** zero dependência nova no app, build estático intacto, e o
  comportamento de cache cabe inteiro em um arquivo legível. Em troca, toda mudança no
  próprio SW exige subir o `CACHE_VERSION` à mão.
