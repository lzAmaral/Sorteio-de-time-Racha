import type { Player, Team } from "./types";
import { sortForDisplay } from "./display";

/**
 * Motivos pelos quais uma troca manual é recusada.
 * - `jogador-nao-encontrado`: um dos ids não está em nenhum time.
 * - `mesmo-time`: os dois jogadores já jogam juntos (inclui trocar o jogador por ele mesmo).
 * - `posicao-incompativel`: goleiro só troca com goleiro (invariante de 1 goleiro por time).
 */
export type SwapErrorCode =
  | "jogador-nao-encontrado"
  | "mesmo-time"
  | "posicao-incompativel";

/** Erro tipado lançado por `swapPlayers`. Use `code` para decidir o feedback na UI. */
export class SwapError extends Error {
  readonly code: SwapErrorCode;

  constructor(code: SwapErrorCode, message: string) {
    super(message);
    this.name = "SwapError";
    this.code = code;
  }
}

/** Resultado discriminado de `canSwap` — permite validar sem try/catch. */
export type SwapCheck =
  | { ok: true }
  | { ok: false; code: SwapErrorCode; message: string };

const MESSAGES: Record<SwapErrorCode, string> = {
  "jogador-nao-encontrado": "Jogador não encontrado nos times",
  "mesmo-time": "Os dois jogadores já estão no mesmo time",
  "posicao-incompativel": "Goleiro só troca com goleiro",
};

/**
 * Verifica se a troca é válida, sem lançar erro. Pensado para a UI dar
 * feedback de bloqueado antes (ou em vez) de chamar `swapPlayers`.
 */
export function canSwap(
  teams: readonly Team[],
  playerIdA: string,
  playerIdB: string,
): SwapCheck {
  const a = locate(teams, playerIdA);
  const b = locate(teams, playerIdB);
  if (!a || !b) return fail("jogador-nao-encontrado");
  if (a.teamIndex === b.teamIndex) return fail("mesmo-time");
  if (a.player.isGoalkeeper !== b.player.isGoalkeeper) {
    return fail("posicao-incompativel");
  }
  return { ok: true };
}

/**
 * Ajuste manual pós-sorteio: troca dois jogadores de times diferentes.
 *
 * Contrato (issue #4): retorna um NOVO array de times — a entrada nunca é mutada —
 * e mantém a ordem de apresentação (goleiro primeiro). Goleiro só troca com
 * goleiro, preservando a invariante de 1 goleiro por time do sorteio (ADR-0003).
 *
 * Em caso inválido lança `SwapError` com `code` (`jogador-nao-encontrado`,
 * `mesmo-time`, `posicao-incompativel`). Para checar antes, use `canSwap`.
 */
export function swapPlayers(
  teams: readonly Team[],
  playerIdA: string,
  playerIdB: string,
): Team[] {
  const check = canSwap(teams, playerIdA, playerIdB);
  if (!check.ok) throw new SwapError(check.code, check.message);

  const a = locate(teams, playerIdA)!;
  const b = locate(teams, playerIdB)!;

  return teams.map((team, teamIndex) => {
    if (teamIndex !== a.teamIndex && teamIndex !== b.teamIndex) {
      return { ...team, players: [...team.players] };
    }
    const incoming = teamIndex === a.teamIndex ? b.player : a.player;
    const outgoingId = teamIndex === a.teamIndex ? playerIdA : playerIdB;
    const players = team.players.map((p) => (p.id === outgoingId ? incoming : p));
    return { ...team, players: sortForDisplay(players) };
  });
}

interface Located {
  teamIndex: number;
  player: Player;
}

function locate(teams: readonly Team[], playerId: string): Located | null {
  for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
    const player = teams[teamIndex]!.players.find((p) => p.id === playerId);
    if (player) return { teamIndex, player };
  }
  return null;
}

function fail(code: SwapErrorCode): SwapCheck {
  return { ok: false, code, message: MESSAGES[code] };
}
