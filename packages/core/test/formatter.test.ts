import { describe, expect, it } from "vitest";
import { formatWhatsApp, whatsAppShareUrl } from "../src/formatter";
import { VESTS } from "../src/vests";
import type { Player, Team } from "../src/types";

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

  it("não cria seção de reservas quando não há reservas", () => {
    expect(text).not.toContain("RESERVAS");
    expect(formatWhatsApp(teams, { reserves: [] })).toBe(text);
  });

  it("lista as reservas numeradas depois dos times e antes do rodapé", () => {
    const reserves: Player[] = [
      { id: "5", name: "Tonho", skill: 3, isGoalkeeper: false, isReserve: true },
      { id: "6", name: "Zé", skill: 3, isGoalkeeper: true, isReserve: true },
    ];
    const comReservas = formatWhatsApp(teams, { reserves });
    const lines = comReservas.split("\n");

    expect(comReservas).toContain("⏳ *RESERVAS*");
    expect(comReservas).toContain("1. Tonho");
    expect(comReservas).toContain("2. Zé 🧤");

    const iTimeBranco = lines.indexOf("🤍 *TIME BRANCO*");
    const iReservas = lines.indexOf("⏳ *RESERVAS*");
    const iRodape = lines.findIndex((l) => l.startsWith("_"));
    expect(iTimeBranco).toBeLessThan(iReservas);
    expect(iReservas).toBeLessThan(iRodape);
    // ordem de chegada preservada
    expect(lines.slice(iReservas + 1, iReservas + 3)).toEqual([
      "1. Tonho",
      "2. Zé 🧤",
    ]);
  });

  it("gera URL do wa.me com texto codificado", () => {
    const url = whatsAppShareUrl("time A & time B");
    expect(url).toBe("https://wa.me/?text=time%20A%20%26%20time%20B");
  });
});
