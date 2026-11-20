import type { DrawOptions, Player, Team } from "./types";
import { shuffle } from "./random";
import { sortForDisplay } from "./display";
import { vestFor } from "./vests";

const MAX_REFINE_PASSES = 60;
const EPSILON = 1e-9;

/**
 * Sorteia os times. Modo "balanced" (default): goleiros primeiro (1 por time),
 * seed greedy com aleatoriedade nos empates e refino por trocas até minimizar o
 * spread de médias. Modo "random": distribuição embaralhada (goleiros ainda 1 por time).
 * Racional completo em docs/decisoes/ADR-0003-algoritmo.md.
 */
export function drawTeams(players: Player[], options: DrawOptions): Team[] {
  const { teamCount, mode = "balanced", rng = Math.random } = options;
  if (!Number.isInteger(teamCount) || teamCount < 2) {
    throw new Error("teamCount deve ser um inteiro ≥ 2");
  }
  if (players.length < teamCount) {
    throw new Error(
      `Jogadores insuficientes: ${players.length} para ${teamCount} times`,
    );
  }

  // Tamanhos diferem em no máximo 1; quem fica com a vaga extra é sorteado.
  const base = Math.floor(players.length / teamCount);
  const remainder = players.length % teamCount;
  const capacities = new Array<number>(teamCount).fill(base);
  for (const teamIndex of shuffle(indices(teamCount), rng).slice(0, remainder)) {
    capacities[teamIndex]! += 1;
  }

  const rosters: Player[][] = Array.from({ length: teamCount }, () => []);

  // Goleiros: 1 por time (ordem de times sorteada); excedentes viram linha.
  const goalkeepers = shuffle(players.filter((p) => p.isGoalkeeper), rng);
  const teamOrder = shuffle(indices(teamCount), rng);
  const overflowGks: Player[] = [];
  goalkeepers.forEach((gk, i) => {
    if (i < teamCount) rosters[teamOrder[i]!]!.push(gk);
    else overflowGks.push(gk);
  });

  // Pool embaralhado → empates em nota ficam aleatórios (re-sorteio varia).
  let pool = shuffle(
    [...overflowGks, ...players.filter((p) => !p.isGoalkeeper)],
    rng,
  );

  if (mode === "balanced") {
    // Sort estável: a ordem embaralhada sobrevive entre notas iguais.
    pool = [...pool].sort((a, b) => b.skill - a.skill);
    for (const player of pool) {
      assignGreedy(rosters, capacities, player);
    }
    refineBySwaps(rosters);
  } else {
    let cursor = 0;
    for (const player of pool) {
      while (rosters[cursor % teamCount]!.length >= capacities[cursor % teamCount]!) {
        cursor++;
      }
      rosters[cursor % teamCount]!.push(player);
      cursor++;
    }
  }

  return rosters.map((roster, i) => ({
    vest: vestFor(i),
    players: sortForDisplay(roster),
  }));
}

/** Diferença entre a maior e a menor média de nota entre os times. */
export function spread(rosters: readonly (readonly Player[])[]): number {
  const averages = rosters.map(average);
  return Math.max(...averages) - Math.min(...averages);
}

function assignGreedy(
  rosters: Player[][],
  capacities: readonly number[],
  player: Player,
): void {
  let best = -1;
  for (let t = 0; t < rosters.length; t++) {
    if (rosters[t]!.length >= capacities[t]!) continue;
    if (best === -1) {
      best = t;
      continue;
    }
    const sumBest = sum(rosters[best]!);
    const sumT = sum(rosters[t]!);
    if (
      sumT < sumBest ||
      (sumT === sumBest && rosters[t]!.length < rosters[best]!.length)
    ) {
      best = t;
    }
  }
  rosters[best]!.push(player);
}

/**
 * Hill-climbing: aplica toda troca par-a-par que reduza o spread de médias.
 * Goleiro só troca com goleiro (preserva 1 por time).
 */
function refineBySwaps(rosters: Player[][]): void {
  for (let pass = 0; pass < MAX_REFINE_PASSES; pass++) {
    let improved = false;
    for (let a = 0; a < rosters.length; a++) {
      for (let b = a + 1; b < rosters.length; b++) {
        for (let i = 0; i < rosters[a]!.length; i++) {
          for (let j = 0; j < rosters[b]!.length; j++) {
            const pa = rosters[a]![i]!;
            const pb = rosters[b]![j]!;
            if (pa.isGoalkeeper !== pb.isGoalkeeper) continue;
            const before = spread(rosters);
            rosters[a]![i] = pb;
            rosters[b]![j] = pa;
            if (spread(rosters) + EPSILON < before) {
              improved = true;
            } else {
              rosters[a]![i] = pa;
              rosters[b]![j] = pb;
            }
          }
        }
      }
    }
    if (!improved) return;
  }
}

function indices(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

function sum(roster: readonly Player[]): number {
  return roster.reduce((total, p) => total + p.skill, 0);
}

function average(roster: readonly Player[]): number {
  return roster.length === 0 ? 0 : sum(roster) / roster.length;
}
