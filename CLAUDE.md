# Sorteio do Racha — Guia para agentes

Produto: *"Cola a lista do grupo, define quantos times e pronto: sorteio equilibrado,
cor de colete pra cada time e resultado pronto pra mandar no zap."* Estratégia: camada
grátis de sorteio como aquisição → monetização B2B vendendo painel para donos de quadra
(R$ 97–197/mês). Tudo em português brasileiro (UI, docs, commits).

## Comandos

```bash
npm install          # na raiz (npm workspaces)
npm run dev          # app web em http://localhost:3000
npm test             # testes do domínio (@racha/core, Vitest)
npm run build        # build de produção do Next
npm run typecheck    # tsc em todos os workspaces
```

## Mapa do repositório

| Caminho | O que é |
|---|---|
| `packages/core` | Domínio puro (`parseList`, `drawTeams`, `formatWhatsApp`, `VESTS`). Zero dependências de runtime. |
| `apps/web` | Next.js 15 (App Router) + Tailwind 4. Fluxo de 3 passos em `components/sorteio-flow.tsx`. |
| `docs/` | Fonte da verdade de produto/negócio. Leia antes de decidir qualquer coisa de escopo. |
| `docs/05-roadmap.md` | Estado das fases. **Atualize os checkboxes ao concluir entregas.** |
| Issues no GitHub | **Fonte das specs executáveis.** Cada task do roadmap é uma issue com escopo e critérios de aceite, agrupada por milestone (fase). Use `gh issue list --milestone "Fase 1 — Lançamento público"` para ver o que está pronto (`spec-pronta`). Ao trabalhar numa issue: branch própria, PR referenciando `Closes #N`, e só feche com os critérios de aceite cumpridos. |
| `docs/decisoes/` | ADRs. Decisão arquitetural nova = novo ADR numerado; não contradiga um ADR aceito sem criar outro que o substitua. |

## Regras do projeto

1. **Regra de negócio nasce no `@racha/core`, com teste** — nunca na UI. O core não usa
   `Math.random` direto: toda aleatoriedade entra por `rng?: () => number` injetável
   (testes usam `seededRng`).
2. **Notas de jogador são privadas do organizador.** Nunca exibir skill no resultado
   compartilhado nem em tela de resultado. É princípio de produto, não detalhe.
3. **Local-first (ADR-0002):** nada de backend, conta ou chamada de rede no MVP.
   Persistência só em `localStorage` (`racha:notas`, `racha:config`).
4. **Parser é melhor-esforço:** nunca lançar erro com entrada bagunçada; formato novo de
   lista = novo caso de teste em `packages/core/test/parser.test.ts`.
5. **Mobile-first:** o usuário está no celular, na beira da quadra, com 4G ruim.
   Qualquer feature nova precisa funcionar bem em tela de 360px.
6. Antes de implementar feature de escopo novo, confira a fase no roadmap — não construir
   infraestrutura de fase futura antes da hora (critério: a fase anterior provou demanda).

## Contexto de pesquisa (não rederive)

A pesquisa de mercado e OSS (18/11/2026) está em `docs/pesquisa/`. Conclusões-chave:
B2C de sorteio é comoditizado e grátis; o dinheiro está no B2B de quadras; algoritmo
greedy + hill-climbing é o ponto ótimo (ML é overkill); percepção de justiça >
otimalidade; concorrente direto Elenko ainda em waitlist.
