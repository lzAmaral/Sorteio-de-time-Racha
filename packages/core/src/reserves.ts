import type { Player } from "./types";

/** Lista separada em quem joga e quem espera. */
export interface ReserveSplit {
  /** Entram no sorteio. */
  active: Player[];
  /** Ficam fora do sorteio, na ordem da lista (ordem de chegada). */
  reserves: Player[];
}

/**
 * Separa titulares de reservas (issue #5). Função pura: não muta a entrada e
 * preserva a ordem original dos dois lados — a lista de espera é "ordem de
 * chegada", então reordenar seria injusto.
 *
 * É o único lugar que define o que é "reserva": `isReserve === true`.
 */
export function splitReserves(players: readonly Player[]): ReserveSplit {
  const active: Player[] = [];
  const reserves: Player[] = [];
  for (const player of players) {
    (player.isReserve ? reserves : active).push(player);
  }
  return { active, reserves };
}
