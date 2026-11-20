# Arquitetura

## Visão geral

Monorepo npm workspaces com o domínio isolado em um pacote puro (sem dependências de
framework), consumido pelo app web. Essa separação é deliberada para desenvolvimento
agêntico: o núcleo tem contrato estável e testes rápidos; a UI evolui sem tocar no domínio.

```
Sorteio-de-time-Racha/
├── packages/
│   └── core/                  # @racha/core — domínio puro em TypeScript
│       ├── src/
│       │   ├── types.ts       # Player, Vest, opções e resultados
│       │   ├── parser.ts      # lista colada do WhatsApp → Player[]
│       │   ├── balancer.ts    # Player[] → times equilibrados
│       │   ├── vests.ts       # paleta de coletes (cor, emoji, hex)
│       │   ├── formatter.ts   # times → texto pronto para o WhatsApp
│       │   └── index.ts       # API pública do pacote
│       └── test/              # Vitest — regras de negócio testadas aqui
├── apps/
│   └── web/                   # @racha/web — Next.js 15 (App Router) + Tailwind 4
│       ├── app/               # layout, página única do fluxo de sorteio
│       └── components/        # componentes do fluxo (3 passos)
└── docs/                      # produto, negócio, pesquisa, ADRs
```

## Decisões estruturais (resumo — detalhes nos ADRs)

| Decisão | Resumo | ADR |
|---|---|---|
| Stack TS + Next.js + Tailwind | Padrão dos projetos polidos do nicho; um só idioma no monorepo | [ADR-0001](decisoes/ADR-0001-stack.md) |
| Local-first, sem backend no MVP | Zero fricção e funciona na beira do campo; Supabase entra na Fase 2 | [ADR-0002](decisoes/ADR-0002-local-first.md) |
| Greedy + hill-climbing no sorteio | Ponto ótimo custo-benefício validado na pesquisa OSS | [ADR-0003](decisoes/ADR-0003-algoritmo.md) |

## O pacote `@racha/core`

Regras do pacote (invariantes que todo agente/dev deve preservar):

1. **Puro e determinístico sob injeção de RNG.** Nenhuma função usa `Math.random`
   diretamente — recebem `rng?: () => number`. Testes usam RNG com seed.
2. **Zero dependências de runtime.** Roda em navegador, Node, edge, React Native futuro.
3. **Toda regra de negócio nova nasce aqui com teste** — nunca na UI.

Fluxo de dados do MVP:

```
texto colado ──parser──▶ Player[] ──(edição do usuário)──▶ Player[]
      Player[] + opções ──balancer──▶ Player[][] (times)
      times + vests ──formatter──▶ texto WhatsApp / UI
```

## O app `apps/web`

- **Página única com fluxo em 3 passos** (cola a lista → define os times → resultado),
  mobile-first, pensada para o organizador no celular.
- **Estado em React + localStorage**: as *notas privadas* (nível 1–5 e flag de goleiro
  por nome de jogador) persistem no navegador do organizador — na semana seguinte, colar
  a lista já recupera as notas. Esse é o começo da retenção, sem exigir conta.
- Compartilhamento: `navigator.clipboard` + deep link `https://wa.me/?text=…`.

## Evolução planejada (não construir antes da hora)

| Fase | Mudança arquitetural |
|---|---|
| Fase 1 (polimento) | PWA (manifest + service worker), compartilhar como imagem (canvas/`html-to-image`), analytics de uso |
| Fase 2 (grupos/contas) | Supabase: auth, Postgres + RLS; `@racha/core` permanece intacto; nasce `packages/db` com schema e acesso |
| Fase 3 (arena B2B) | Novo app `apps/arena` (painel do dono de quadra) no mesmo monorepo, reusando core e db; cobrança Pix via PSP (ex.: Mercado Pago, Asaas) |
| Fase 4 (marketplace) | Página pública de quadras + vagas avulsas; só então existe backend "de verdade" com jobs |

Critério geral: **cada fase só adiciona infraestrutura quando a anterior prova demanda.**

## Qualidade

- Testes: Vitest no core (`npm test`). Regra: parser e balancer têm teste para cada
  formato/invariante novo.
- Build de produção: `npm run build` (Next). CI (GitHub Actions) entra na Fase 1.
- TypeScript `strict` em todos os pacotes (config compartilhada em `tsconfig.base.json`).
