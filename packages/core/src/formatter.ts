import type { FormatOptions, Team } from "./types";

/**
 * Texto pronto para colar no grupo. As notas dos jogadores NUNCA entram aqui
 * (princípio: nota é privada do organizador — ADR-0003).
 */
export function formatWhatsApp(teams: Team[], options: FormatOptions = {}): string {
  const {
    title = "SORTEIO DO RACHA",
    footer = "Sorteado em segundos — bora pro jogo!",
  } = options;

  const lines: string[] = [`⚽ *${title}* ⚽`, ""];
  for (const team of teams) {
    lines.push(`${team.vest.emoji} *TIME ${team.vest.name.toUpperCase()}*`);
    team.players.forEach((player, i) => {
      lines.push(`${i + 1}. ${player.name}${player.isGoalkeeper ? " 🧤" : ""}`);
    });
    lines.push("");
  }
  lines.push(`_${footer}_`);
  return lines.join("\n");
}

export function whatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
