import { describe, expect, it } from "vitest";
import { drawTeams, spread } from "../src/balancer";
import { seededRng } from "../src/random";
import type { Player } from "../src/types";

function player(
  name: string,
  skill = 3,
  isGoalkeeper = false,
): Player {
  return { id: name, name, skill, isGoalkeeper };
}

function roster(count: number, skills: number[] = []): Player[] {
  return Array.from({ length: count }, (_, i) =>
    player(`J${i}`, skills[i] ?? ((i % 5) + 1)),
  );
}

describe("drawTeams", () => {
  it("distribui todos os jogadores com tamanhos diferindo no máximo em 1", () => {
    const teams = drawTeams(roster(14), { teamCount: 3, rng: seededRng(1) });
    const sizes = teams.map((t) => t.players.length).sort();
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(14);
    expect(sizes[sizes.length - 1]! - sizes[0]!).toBeLessThanOrEqual(1);
    const ids = teams.flatMap((t) => t.players.map((p) => p.id)).sort();
    expect(ids).toEqual(roster(14).map((p) => p.id).sort());
  });

  it("aloca no máximo 1 goleiro por time quando há goleiros suficientes ou menos", () => {
    const players = [
      player("G1", 3, true),
      player("G2", 4, true),
      ...roster(10),
    ];
    const teams = drawTeams(players, { teamCount: 3, rng: seededRng(2) });
    for (const team of teams) {
      expect(team.players.filter((p) => p.isGoalkeeper).length).toBeLessThanOrEqual(1);
    }
  });

  it("goleiro excedente vira linha (times não ficam sem equilíbrio de contagem)", () => {
    const players = [
      player("G1", 3, true),
      player("G2", 3, true),
      player("G3", 3, true),
      ...roster(5),
    ];
    const teams = drawTeams(players, { teamCount: 2, rng: seededRng(3) });
    const total = teams.reduce((n, t) => n + t.players.length, 0);
    expect(total).toBe(8);
  });

  it("modo balanced produz spread de médias baixo", () => {
    const skills = [5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 1, 1];
    const teams = drawTeams(roster(12, skills), {
      teamCount: 2,
      rng: seededRng(4),
    });
    expect(spread(teams.map((t) => t.players))).toBeLessThanOrEqual(0.5);
  });

  it("balanced é consistentemente mais justo que random", () => {
    const skills = [5, 5, 5, 4, 4, 1, 1, 1, 2, 2, 3, 3, 4, 5, 1, 2];
    let balancedWorst = 0;
    let randomWorst = 0;
    for (let seed = 0; seed < 20; seed++) {
      const b = drawTeams(roster(16, skills), {
        teamCount: 4,
        rng: seededRng(seed),
      });
      const r = drawTeams(roster(16, skills), {
        teamCount: 4,
        mode: "random",
        rng: seededRng(seed),
      });
      balancedWorst = Math.max(balancedWorst, spread(b.map((t) => t.players)));
      randomWorst = Math.max(randomWorst, spread(r.map((t) => t.players)));
    }
    expect(balancedWorst).toBeLessThanOrEqual(randomWorst);
    expect(balancedWorst).toBeLessThanOrEqual(1);
  });

  it("é determinístico com o mesmo seed e varia com seeds diferentes", () => {
    const players = roster(12);
    const a = drawTeams(players, { teamCount: 2, rng: seededRng(7) });
    const b = drawTeams(players, { teamCount: 2, rng: seededRng(7) });
    expect(a.map((t) => t.players.map((p) => p.id))).toEqual(
      b.map((t) => t.players.map((p) => p.id)),
    );
    const variations = new Set(
      Array.from({ length: 10 }, (_, seed) =>
        JSON.stringify(
          drawTeams(players, { teamCount: 2, rng: seededRng(seed) }).map((t) =>
            t.players.map((p) => p.id),
          ),
        ),
      ),
    );
    expect(variations.size).toBeGreaterThan(1);
  });

  it("goleiro aparece primeiro na listagem do time", () => {
    const players = [...roster(7), player("Paredão", 2, true)];
    const teams = drawTeams(players, { teamCount: 2, rng: seededRng(9) });
    const withGk = teams.find((t) => t.players.some((p) => p.isGoalkeeper))!;
    expect(withGk.players[0]!.isGoalkeeper).toBe(true);
  });

  it("valida entradas", () => {
    expect(() => drawTeams(roster(3), { teamCount: 1 })).toThrow();
    expect(() => drawTeams(roster(3), { teamCount: 4 })).toThrow();
  });
});
