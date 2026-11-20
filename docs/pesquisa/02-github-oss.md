# Pesquisa GitHub — Projetos Open-Source de Sorteio/Balanceamento de Times

> Pesquisa realizada em 18/11/2026 via GitHub CLI (`gh search repos`, `gh api`).
> Conclusão geral: nicho de **muitos projetos pequenos (0–6 estrelas), sem líder
> consolidado** — espaço aberto para um projeto bem-feito.

## Repositórios mais relevantes

| Repositório | ⭐ | Stack | Destaque |
|---|---|---|---|
| [nicvlav/lineups](https://github.com/nicvlav/lineups) | 1 | React+Vite, TS, Supabase | Algoritmo mais sofisticado: 6 capacidades, zonas, formações, swap por clique |
| [Gnyblast/Futsal-Team-Builder](https://github.com/Gnyblast/Futsal-Team-Builder) | 4 | Angular 17 | Score ponderado por posição; oculta notas antes de compartilhar |
| [ronit404/Team-Balancer](https://github.com/ronit404/Team-Balancer) | 4 | Next.js 15, Supabase | Greedy por skill; workspaces; swap manual |
| [dezGusty/team-balancer](https://github.com/dezGusty/team-balancer) | 3 | Angular + Firebase | Rating evolui com resultados; mostra top 20 divisões para escolher |
| [hercase/teammaker](https://github.com/hercase/teammaker) | 2 | Next 15, React 19, Zustand, Vitest | Cola lista do WhatsApp → compartilha como **imagem**; local-first sem servidor; cores de colete |
| [micdog22/tira-time](https://github.com/micdog22/tira-time) | 0 | HTML/JS puro (MIT) | Feito p/ pelada BR: parser do zap, goleiros à parte, "cobrinha" + hill-climbing de trocas |
| [rajtslegr/sm-fairplay](https://github.com/rajtslegr/sm-fairplay) | 0 | Svelte, TS (MIT) | Branch-and-bound com poda + **sinergia de duplas** por histórico |
| [giorgiofellipe/PeladaDeQuinta](https://github.com/giorgiofellipe/PeladaDeQuinta) | 6 | Java Android (2014) | Clássico BR: estrelas 1–3, goleiro, presença |
| [diegodanielcaceres10/kora-roster-web](https://github.com/diegodanielcaceres10/kora-roster-web) | 0 | Next.js, i18n PT | Parser tolerante a lista bagunçada do WhatsApp |

## Níveis de algoritmo encontrados

1. **Aleatório puro** — `shuffle` + round-robin (maioria dos projetos BR). Não balanceia.
2. **Greedy por skill** (Team-Balancer) — ordena desc e joga sempre no time com menor soma.
   Simples e eficaz, mas determinístico.
3. **Cobrinha + hill-climbing** (tira-time) — embaralha (variedade nos empates), snake draft,
   goleiros antes (1 por time), depois trocas par-a-par aplicadas enquanto reduzirem a
   diferença. Garantia empírica documentada: gap ≤ 5 pontos.
4. **Busca exaustiva / branch-and-bound** (dezGusty, sm-fairplay) — ótimo global viável
   para ≤ ~16 jogadores em 2 times; sm-fairplay adiciona sinergia de duplas e escolhe
   resultado "quase ótimo" de propósito para variar.
5. **Multi-dimensional com metaheurística** (lineups, `src/auto-balance/balance.ts`) —
   seed greedy randomizado → swap search → restarts; penalidades multiplicativas por
   capacidade, variância, "estrelas" e zonas. Referência se um dia adotarmos atributos
   múltiplos.

## Features: o que é padrão vs. lacuna

**Table stakes:** níveis 1–5, flag goleiro (1 por time), presença, re-sorteio, copiar
texto p/ WhatsApp, persistência local.

**Raras (diferenciais já validados em algum projeto):** parser da lista colada do zap,
compartilhar como imagem, rating evolutivo por resultados, múltiplas opções de divisão,
ocultar notas no resultado, cores de colete, reservas.

**Lacunas (quase ninguém faz):**
1. Histórico + rating que se auto-ajusta por resultado com UX de pelada BR
2. Sinergia/anti-sinergia ("esses dois sempre separados")
3. Rotação de quem fica de fora (racha com fila "quem perde sai")
4. Travar jogador em time / restrições manuais
5. Notas colaborativas anônimas (tira o organizador do papel de vilão)
6. Financeiro integrado ao sorteio (mensalista vs. avulso)
7. Multi-times (3+) bem resolvido — a maioria só divide em 2
8. PWA offline-first com link compartilhável, sem login

## Recomendações de stack extraídas

- **React/Next.js + TypeScript + Tailwind**: stack de todos os projetos recentes polidos.
- **Local-first primeiro** (teammaker prova que o produto principal não precisa de
  backend): zero atrito, funciona com 4G ruim na beira do campo.
- **Supabase (PostgreSQL)** é a escolha unânime dos projetos que evoluíram para sync/contas.
- **Algoritmo**: snake/greedy + hill-climbing é o ponto ótimo custo-benefício; exaustivo
  para casos pequenos; ML é overkill comprovado (projeto TensorFlow do nicho tem 1 ⭐).
- **Licença MIT** desde o início (quase nenhum projeto BR tem licença).
