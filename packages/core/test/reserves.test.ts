import { describe, expect, it } from "vitest";
import { splitReserves } from "../src/reserves";
import { drawTeams } from "../src/balancer";
import { seededRng } from "../src/random";
import type { Player } from "../src/types";

function player(name: string, isReserve = false, isGoalkeeper = false): Player {
  return { id: name, name, skill: 3, isGoalkeeper, isReserve };
}

describe("splitReserves", () => {
  it("separa titulares de reservas preservando a ordem da lista", () => {
    const players = [
      player("João"),
      player("Tonho", true),
      player("Pedro"),
      player("Zé", true),
    ];
    const { active, reserves } = splitReserves(players);
    expect(active.map((p) => p.name)).toEqual(["João", "Pedro"]);
    expect(reserves.map((p) => p.name)).toEqual(["Tonho", "Zé"]);
  });

  it("trata isReserve ausente como titular e não muta a entrada", () => {
    const players: Player[] = [
      { id: "1", name: "João", skill: 3, isGoalkeeper: false },
      player("Tonho", true),
    ];
    const snapshot = JSON.stringify(players);
    const { active, reserves } = splitReserves(players);
    expect(active.map((p) => p.name)).toEqual(["João"]);
    expect(reserves.map((p) => p.name)).toEqual(["Tonho"]);
    expect(JSON.stringify(players)).toBe(snapshot);
  });

  it("lida com lista toda titular e lista toda reserva", () => {
    expect(splitReserves([player("A"), player("B")]).reserves).toEqual([]);
    expect(splitReserves([player("A", true)]).active).toEqual([]);
    expect(splitReserves([]).active).toEqual([]);
  });
});

describe("drawTeams com reservas", () => {
  const lista = [
    player("Moreli", false, true),
    player("João"),
    player("Pedro"),
    player("Lucas"),
    player("Rafa"),
    player("Tonho", true),
    player("Zé", true, true),
  ];

  it("reserva não entra em nenhum time", () => {
    const teams = drawTeams(lista, { teamCount: 2, rng: seededRng(1) });
    const escalados = teams.flatMap((t) => t.players.map((p) => p.name));
    expect(escalados).toHaveLength(5);
    expect(escalados).not.toContain("Tonho");
    expect(escalados).not.toContain("Zé");
    expect(escalados.sort()).toEqual(
      ["João", "Lucas", "Moreli", "Pedro", "Rafa"].sort(),
    );
  });

  it("conta só os titulares ao validar jogadores insuficientes", () => {
    const players = [player("A"), player("B", true), player("C", true)];
    expect(() => drawTeams(players, { teamCount: 2 })).toThrow(
      /Jogadores insuficientes: 1/,
    );
  });

  it("goleiro reserva não ocupa a vaga de goleiro do time", () => {
    const teams = drawTeams(lista, { teamCount: 2, rng: seededRng(5) });
    const comGk = teams.filter((t) => t.players.some((p) => p.isGoalkeeper));
    expect(comGk).toHaveLength(1);
    expect(comGk[0]!.players[0]!.name).toBe("Moreli");
  });
});
