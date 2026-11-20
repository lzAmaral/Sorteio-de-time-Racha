import { describe, expect, it } from "vitest";
import { canSwap, SwapError, swapPlayers } from "../src/swap";
import { vestFor } from "../src/vests";
import type { Player, Team } from "../src/types";

function player(name: string, skill = 3, isGoalkeeper = false): Player {
  return { id: name, name, skill, isGoalkeeper };
}

/** Dois times: goleiro primeiro, como sai do sorteio. */
function sampleTeams(): Team[] {
  return [
    {
      vest: vestFor(0),
      players: [player("G1", 3, true), player("A1", 5), player("A2", 2)],
    },
    {
      vest: vestFor(1),
      players: [player("G2", 4, true), player("B1", 1), player("B2", 4)],
    },
  ];
}

function names(teams: Team[]): string[][] {
  return teams.map((t) => t.players.map((p) => p.name));
}

describe("swapPlayers", () => {
  it("troca dois jogadores de linha de times diferentes", () => {
    const teams = swapPlayers(sampleTeams(), "A1", "B1");
    expect(names(teams)).toEqual([
      ["G1", "B1", "A2"],
      ["G2", "A1", "B2"],
    ]);
  });

  it("troca goleiro com goleiro mantendo 1 goleiro por time", () => {
    const teams = swapPlayers(sampleTeams(), "G1", "G2");
    expect(names(teams)).toEqual([
      ["G2", "A1", "A2"],
      ["G1", "B1", "B2"],
    ]);
    for (const team of teams) {
      expect(team.players.filter((p) => p.isGoalkeeper)).toHaveLength(1);
    }
  });

  it("bloqueia goleiro↔linha com code posicao-incompativel", () => {
    expect(() => swapPlayers(sampleTeams(), "G1", "B1")).toThrowError(SwapError);
    try {
      swapPlayers(sampleTeams(), "G1", "B1");
    } catch (error) {
      expect((error as SwapError).code).toBe("posicao-incompativel");
    }
    // e na ordem inversa também
    try {
      swapPlayers(sampleTeams(), "A1", "G2");
    } catch (error) {
      expect((error as SwapError).code).toBe("posicao-incompativel");
    }
  });

  it("recusa jogadores do mesmo time", () => {
    try {
      swapPlayers(sampleTeams(), "A1", "A2");
      expect.unreachable("deveria ter lançado");
    } catch (error) {
      expect((error as SwapError).code).toBe("mesmo-time");
    }
  });

  it("recusa trocar o jogador por ele mesmo (mesmo time)", () => {
    try {
      swapPlayers(sampleTeams(), "A1", "A1");
      expect.unreachable("deveria ter lançado");
    } catch (error) {
      expect((error as SwapError).code).toBe("mesmo-time");
    }
  });

  it("recusa id inexistente", () => {
    try {
      swapPlayers(sampleTeams(), "A1", "nao-existe");
      expect.unreachable("deveria ter lançado");
    } catch (error) {
      expect((error as SwapError).code).toBe("jogador-nao-encontrado");
      expect((error as SwapError).message).toMatch(/não encontrado/i);
    }
  });

  it("não muta a entrada (times e arrays de jogadores novos)", () => {
    const original = sampleTeams();
    const snapshot = JSON.parse(JSON.stringify(original));
    const result = swapPlayers(original, "A1", "B1");
    expect(original).toEqual(snapshot);
    expect(result).not.toBe(original);
    result.forEach((team, i) => {
      expect(team.players).not.toBe(original[i]!.players);
    });
  });

  it("mantém o goleiro primeiro mesmo quando o goleiro não está no índice 0", () => {
    const teams: Team[] = [
      {
        vest: vestFor(0),
        players: [player("A1", 5), player("G1", 3, true)],
      },
      {
        vest: vestFor(1),
        players: [player("G2", 4, true), player("B1", 1)],
      },
    ];
    expect(names(swapPlayers(teams, "A1", "B1"))).toEqual([
      ["G1", "B1"],
      ["G2", "A1"],
    ]);
  });

  it("preserva os coletes de cada time", () => {
    const teams = swapPlayers(sampleTeams(), "A1", "B1");
    expect(teams.map((t) => t.vest.name)).toEqual([
      vestFor(0).name,
      vestFor(1).name,
    ]);
  });

  it("não perde nem duplica jogadores com 3 times", () => {
    const teams: Team[] = [0, 1, 2].map((i) => ({
      vest: vestFor(i),
      players: [player(`T${i}a`), player(`T${i}b`)],
    }));
    const result = swapPlayers(teams, "T0a", "T2b");
    const ids = result.flatMap((t) => t.players.map((p) => p.id)).sort();
    expect(ids).toEqual(["T0a", "T0b", "T1a", "T1b", "T2a", "T2b"]);
    expect(result[1]!.players.map((p) => p.id)).toEqual(["T1a", "T1b"]);
  });

  it("é reversível: trocar de novo volta ao estado original", () => {
    const original = sampleTeams();
    const voltou = swapPlayers(swapPlayers(original, "A1", "B1"), "B1", "A1");
    expect(names(voltou)).toEqual(names(original));
  });
});

describe("canSwap", () => {
  it("aprova troca válida", () => {
    expect(canSwap(sampleTeams(), "A1", "B1")).toEqual({ ok: true });
  });

  it("devolve resultado discriminado em cada caso inválido", () => {
    const teams = sampleTeams();
    expect(canSwap(teams, "G1", "B1")).toMatchObject({
      ok: false,
      code: "posicao-incompativel",
    });
    expect(canSwap(teams, "A1", "A2")).toMatchObject({
      ok: false,
      code: "mesmo-time",
    });
    expect(canSwap(teams, "A1", "fantasma")).toMatchObject({
      ok: false,
      code: "jogador-nao-encontrado",
    });
  });
});
