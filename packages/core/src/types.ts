/** Um jogador da lista do racha. */
export interface Player {
  id: string;
  name: string;
  /** Nota privada do organizador, 1–5. Nunca aparece no resultado compartilhado. */
  skill: number;
  isGoalkeeper: boolean;
  /** true se a nota veio explícita na lista colada (ex.: "João - 4"). */
  skillExplicit?: boolean;
}

/** Cor de colete com representação para UI e para texto do WhatsApp. */
export interface Vest {
  name: string;
  emoji: string;
  hex: string;
  textHex: string;
}

export type DrawMode = "balanced" | "random";

export interface DrawOptions {
  teamCount: number;
  mode?: DrawMode;
  /**
   * Fonte de aleatoriedade injetável (0 ≤ rng() < 1). Default: Math.random.
   * Testes usam RNG com seed para determinismo.
   */
  rng?: () => number;
}

export interface Team {
  vest: Vest;
  players: Player[];
}

export interface FormatOptions {
  title?: string;
  footer?: string;
}
