# ADR-0001 — Stack: TypeScript + Next.js + Tailwind, monorepo npm workspaces

- **Status:** aceita (18/11/2026)
- **Contexto:** a pesquisa OSS ([docs/pesquisa/02-github-oss.md](../pesquisa/02-github-oss.md))
  mostrou que todos os projetos recentes e polidos do nicho usam React/Next + TS + Tailwind;
  o produto é web mobile-first (o usuário chega pelo link no WhatsApp); e o roadmap prevê
  múltiplos apps (sorteio, arena) compartilhando o mesmo domínio.
- **Decisão:**
  1. TypeScript estrito em tudo (o domínio Player/Team/Score se beneficia muito de tipos).
  2. Next.js 15 (App Router) para o(s) app(s) web; Tailwind 4 para estilo.
  3. Monorepo com **npm workspaces** (pnpm não está instalado na máquina e npm 11 resolve
     o mesmo problema sem ferramenta extra): `packages/core` (domínio puro) + `apps/web`.
  4. `@racha/core` publica TypeScript-fonte (`main: src/index.ts`) e o Next transpila via
     `transpilePackages` — sem etapa de build no pacote.
- **Alternativas rejeitadas:** app mobile nativo/Flutter (fricção de instalação mata a
  camada grátis; PWA cobre); backend desde o início (ver ADR-0002); ML no sorteio
  (overkill comprovado na pesquisa).
- **Consequências:** um idioma único em todo o repo; adicionar `apps/arena` na Fase 3 é
  criar mais um workspace; se o repo crescer muito, migrar para pnpm+turborepo é trivial.
