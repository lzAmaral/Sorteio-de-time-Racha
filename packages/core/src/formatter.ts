import type { FormatOptions, Player, Team } from "./types";

/**
 * Texto pronto para colar no grupo. As notas dos jogadores NUNCA entram aqui
 * (princípio: nota é privada do organizador — ADR-0003).
 */
export function formatWhatsApp(teams: Team[], options: FormatOptions = {}): string {
  const {
    title = "SORTEIO DO RACHA",
    footer = "Sorteado em segundos — bora pro jogo!",
    reserves = [],
  } = options;

  const lines: string[] = [`⚽ *${title}* ⚽`, ""];
  for (const team of teams) {
    lines.push(`${team.vest.emoji} *TIME ${team.vest.name.toUpperCase()}*`);
    lines.push(...numbered(team.players));
    lines.push("");
  }
  // Lista de espera, na ordem de chegada (issue #5).
  if (reserves.length > 0) {
    lines.push("⏳ *RESERVAS*");
    lines.push(...numbered(reserves));
    lines.push("");
  }
  lines.push(`_${footer}_`);
  return lines.join("\n");
}

function numbered(players: readonly Player[]): string[] {
  return players.map(
    (player, i) => `${i + 1}. ${player.name}${player.isGoalkeeper ? " 🧤" : ""}`,
  );
}

export function whatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
