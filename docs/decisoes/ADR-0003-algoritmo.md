# ADR-0003 — Sorteio: greedy com aleatoriedade + hill-climbing de trocas

- **Status:** aceita (18/11/2026)
- **Contexto:** o espectro de algoritmos do nicho vai de shuffle puro a metaheurísticas
  multi-dimensionais ([pesquisa OSS](../pesquisa/02-github-oss.md), seção "níveis").
  A pesquisa de mercado concluiu que **percepção de justiça e explicabilidade** importam
  mais que otimalidade.
- **Decisão:**
  1. Nota única 1–5 por jogador (padrão BR consolidado), default 3; flag de goleiro.
  2. Goleiros alocados primeiro, 1 por time; excedentes viram linha.
  3. Seed: embaralha → ordena por nota (sort estável → empates aleatórios → re-sorteio
     varia) → greedy no time com menor soma e vaga livre.
  4. Refino: trocas par-a-par (goleiro↔goleiro apenas) aplicadas enquanto reduzirem o
     spread de **médias** dos times (média, não soma, por causa de times de tamanho
     desigual). Teto de iterações como segurança.
  5. RNG sempre injetável (`rng?: () => number`) — determinismo em teste, variedade em
     produção.
  6. As notas **nunca** aparecem no resultado compartilhado.
- **Alternativas:** busca exaustiva/branch-and-bound (ótimo global p/ 2 times ≤ ~16
  jogadores) — fica como otimização futura atrás da mesma API; atributos múltiplos por
  posição (modelo lineups) — complexidade de input que o organizador de racha não quer.
- **Consequências:** resultado explicável ("os times têm médias quase iguais"),
  re-sorteio gera variações legítimas, e restrições futuras (travar jogador, manter
  separados) entram como filtros de troca no passo 4 sem reescrever nada.
