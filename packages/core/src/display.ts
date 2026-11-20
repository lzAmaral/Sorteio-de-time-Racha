import type { Player } from "./types";

/**
 * Ordem de apresentação de um time: goleiro primeiro, linha na sequência
 * (etapa 4 do algoritmo — docs/04-algoritmo.md). Retorna uma cópia.
 */
export function sortForDisplay(roster: readonly Player[]): Player[] {
  return [
    ...roster.filter((p) => p.isGoalkeeper),
    ...roster.filter((p) => !p.isGoalkeeper),
  ];
}
