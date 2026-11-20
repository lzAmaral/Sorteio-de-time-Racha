import type { Vest } from "./types";

/** Cores de colete que existem de verdade nas quadras, na ordem de uso. */
export const VESTS: Vest[] = [
  { name: "Preto", emoji: "🖤", hex: "#18181b", textHex: "#ffffff" },
  { name: "Branco", emoji: "🤍", hex: "#fafafa", textHex: "#18181b" },
  { name: "Laranja", emoji: "🧡", hex: "#f97316", textHex: "#ffffff" },
  { name: "Azul", emoji: "💙", hex: "#2563eb", textHex: "#ffffff" },
  { name: "Verde", emoji: "💚", hex: "#16a34a", textHex: "#ffffff" },
  { name: "Vermelho", emoji: "❤️", hex: "#dc2626", textHex: "#ffffff" },
  { name: "Amarelo", emoji: "💛", hex: "#eab308", textHex: "#18181b" },
  { name: "Roxo", emoji: "💜", hex: "#9333ea", textHex: "#ffffff" },
];

export function vestFor(teamIndex: number): Vest {
  return VESTS[teamIndex % VESTS.length]!;
}
