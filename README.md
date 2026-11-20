# ⚽ Sorteio do Racha

[![CI](https://github.com/lzAmaral/Sorteio-de-time-Racha/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/lzAmaral/Sorteio-de-time-Racha/actions/workflows/ci.yml)
[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)

**Cola a lista do grupo, define quantos times e pronto:** sorteio equilibrado, cor de
colete pra cada time e o resultado pronto pra mandar no zap.

- 🆓 Grátis, sem cadastro, direto no navegador (mobile-first)
- 📋 Entende a lista colada do WhatsApp em qualquer formato (números, emojis, `(g)`, `⭐`)
- ⚖️ Sorteio equilibrado por notas privadas (1–5) com goleiro garantido em cada time
- ⏳ Reservas/suplentes: ficam fora do sorteio e saem numa lista de espera no resultado
- 🎽 Cores de colete reais de quadra (preto, branco, laranja, azul…)
- 💬 Resultado formatado para copiar ou mandar direto no WhatsApp
- 🔒 As notas ficam **só no navegador do organizador** — ninguém descobre a própria nota

## Rodando

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # testes do domínio
npm run build     # build de produção
```

Requisitos: Node 20+ (repo usa npm workspaces).

## Estrutura

```
packages/core   # domínio puro: parser da lista, sorteio equilibrado, formatação p/ WhatsApp
apps/web        # Next.js 15 + Tailwind 4 — fluxo de 3 passos
docs/           # visão de produto, negócio, arquitetura, algoritmo, roadmap, ADRs e pesquisa
```

## Documentação

| Doc | Conteúdo |
|---|---|
| [Visão de produto](docs/01-visao-produto.md) | Estratégia em 3 camadas (grátis → organizador → arena) |
| [Negócio](docs/02-negocio.md) | Monetização B2B para donos de quadra, pricing, go-to-market |
| [Arquitetura](docs/03-arquitetura.md) | Monorepo, invariantes do core, evolução por fases |
| [Algoritmo](docs/04-algoritmo.md) | Parser do WhatsApp + sorteio (greedy + hill-climbing) |
| [Roadmap](docs/05-roadmap.md) | Fases 0–4 com status |
| [Pesquisa](docs/pesquisa/) | Mercado (Elenko, concorrentes, preços B2B) e projetos open-source |
| [Decisões](docs/decisoes/) | ADRs |

## Por que existe

O mercado B2C de apps de pelada é saturado e grátis; donos de quadra pagam R$ 97–250/mês
por sistemas que só fazem agenda. Este projeto usa o sorteio grátis como aquisição e mira
o B2B: um painel para arenas que **gerencia o racha e garante o pagamento por jogador** —
ciclo que ninguém fecha no Brasil hoje. Detalhes na [pesquisa](docs/pesquisa/01-mercado.md).

## Licença

[MIT](LICENSE) © 2026 Luiz Amaral
