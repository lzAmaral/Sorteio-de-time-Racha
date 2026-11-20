import { describe, expect, it } from "vitest";
import { parseList } from "../src/parser";

describe("parseList", () => {
  it("lê lista numerada típica do WhatsApp", () => {
    const players = parseList(
      ["1. João", "2- Pedro", "3) Lucas", "4 - Rafa", "10. Zé da Padaria"].join(
        "\n",
      ),
    );
    expect(players.map((p) => p.name)).toEqual([
      "João",
      "Pedro",
      "Lucas",
      "Rafa",
      "Zé da Padaria",
    ]);
    expect(players.every((p) => p.skill === 3)).toBe(true);
  });

  it("detecta goleiros em vários formatos", () => {
    const players = parseList(
      ["Carlão (g)", "Dudu (GK)", "Max 🧤", "Beto goleiro", "Linha Silva"].join(
        "\n",
      ),
    );
    expect(players.map((p) => p.isGoalkeeper)).toEqual([
      true,
      true,
      true,
      true,
      false,
    ]);
    expect(players.map((p) => p.name)).toEqual([
      "Carlão",
      "Dudu",
      "Max",
      "Beto",
      "Linha Silva",
    ]);
  });

  it("lê notas explícitas: traço, parênteses e estrelas", () => {
    const players = parseList(
      ["João - 4", "Pedro (5)", "Lucas ⭐⭐", "Marcos"].join("\n"),
    );
    expect(players.map((p) => [p.skill, p.skillExplicit ?? false])).toEqual([
      [4, true],
      [5, true],
      [2, true],
      [3, false],
    ]);
    expect(players.map((p) => p.name)).toEqual([
      "João",
      "Pedro",
      "Lucas",
      "Marcos",
    ]);
  });

  it("ignora cabeçalhos, linhas vazias e decoração", () => {
    const players = parseList(
      [
        "Racha de sábado 19h ⚽🔥",
        "Confirmados:",
        "Quadra do Zé, 20h30",
        "",
        "1. 🔥 Bruno 🔥",
        "- - -",
        "2. Ana",
      ].join("\n"),
    );
    expect(players.map((p) => p.name)).toEqual(["Bruno", "Ana"]);
  });

  it("linha numerada nunca é tratada como cabeçalho", () => {
    // "Domingo" pode ser apelido; numerado, é jogador.
    const players = parseList("1. Domingo\n2. Galera Jr");
    expect(players.map((p) => p.name)).toEqual(["Domingo", "Galera Jr"]);
  });

  it("nunca lança erro com entrada bagunçada e preserva ordem", () => {
    const messy = "⚽⚽⚽\n\n\n1.João-5\n   2 .  Maria (g) ⭐⭐⭐⭐  \n🧤\n>>> x";
    const players = parseList(messy);
    expect(players[0]).toMatchObject({ name: "João", skill: 5 });
    expect(players[1]).toMatchObject({
      name: "Maria",
      skill: 4,
      isGoalkeeper: true,
    });
  });

  it("entende seções *Goleiro:*/*Linha:* (lista real de grupo)", () => {
    const lista = [
      "*Lista do Fut - quarta às 9 hrs",
      "",
      " ",
      "*Goleiro:*",
      "1 - Moreli",
      "2 - Eraldo",
      "3 - Xavier o petista ",
      "",
      "*Linha:*",
      "1- Massuia✅",
      "2- Nogueira ",
      "3- Brunão ✅",
      "4- vitinho ✅",
      "5- bertanha ",
      "6- Weslin ✅",
      "7- pato",
      "8- lucão",
      "9- vinicin ",
      "10-pedro dias ",
      "11- arthur ✅",
      "12- fernando",
      "13-  Luiz✅",
      "14-Garcia ",
      "15-Querino",
      "16- Igor✅",
      "17- morgado",
      "18-Flora",
    ].join("\n");
    const players = parseList(lista);

    expect(players).toHaveLength(21);
    const gks = players.filter((p) => p.isGoalkeeper).map((p) => p.name);
    expect(gks).toEqual(["Moreli", "Eraldo", "Xavier o petista"]);
    expect(players.map((p) => p.name)).toContain("Massuia");
    expect(players.map((p) => p.name)).toContain("pedro dias");
    expect(players.map((p) => p.name)).toContain("Flora");
    expect(players.map((p) => p.name)).not.toContain("Lista do Fut");
    // ✅ de confirmação não vira parte do nome
    expect(players.every((p) => !p.name.includes("✅"))).toBe(true);
  });

  it("permite nomes duplicados", () => {
    const players = parseList("João\nJoão");
    expect(players).toHaveLength(2);
    expect(players[0]!.id).not.toBe(players[1]!.id);
  });
});
