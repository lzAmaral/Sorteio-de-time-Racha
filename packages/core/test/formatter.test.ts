import { describe, expect, it } from "vitest";
import { formatWhatsApp, whatsAppShareUrl } from "../src/formatter";
import { VESTS } from "../src/vests";
import type { Team } from "../src/types";

const teams: Team[] = [
  {
    vest: VESTS[0]!,
    players: [
      { id: "1", name: "Carlão", skill: 4, isGoalkeeper: true },
      { id: "2", name: "João", skill: 5, isGoalkeeper: false },
    ],
  },
  {
    vest: VESTS[1]!,
    players: [
      { id: "3", name: "Max", skill: 3, isGoalkeeper: true },
      { id: "4", name: "Pedro", skill: 1, isGoalkeeper: false },
    ],
  },
];

describe("formatWhatsApp", () => {
  const text = formatWhatsApp(teams);

  it("inclui título, times com emoji de colete e goleiro marcado", () => {
    expect(text).toContain("⚽ *SORTEIO DO RACHA* ⚽");
    expect(text).toContain("🖤 *TIME PRETO*");
    expect(text).toContain("🤍 *TIME BRANCO*");
    expect(text).toContain("1. Carlão 🧤");
    expect(text).toContain("2. João");
  });

  it("nunca expõe as notas dos jogadores", () => {
    for (const team of teams) {
      for (const p of team.players) {
        expect(text).not.toContain(`${p.name} - ${p.skill}`);
        expect(text).not.toContain(`(${p.skill})`);
      }
    }
  });

  it("gera URL do wa.me com texto codificado", () => {
    const url = whatsAppShareUrl("time A & time B");
    expect(url).toBe("https://wa.me/?text=time%20A%20%26%20time%20B");
  });
});
