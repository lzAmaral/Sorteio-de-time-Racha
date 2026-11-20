import type { Player } from "./types";

const DEFAULT_SKILL = 3;

// Goleiro: "(g)", "(gk)", "(gol)", "(goleiro)", palavra solta "gk"/"goleiro", ou 🧤.
const GK_PAREN = /[([{]\s*(?:g|gk|gol|goleiro)\s*[)\]}]/iu;
const GK_WORD = /(?:^|\s)(?:gk|goleiro)(?=\s|$)/iu;
const GK_GLOVE = /🧤/u;

// Nota explícita no fim da linha: "João - 4", "Pedro (5)", "Lucas: 2", "Rafa [3]".
const TRAILING_SKILL = /(?:[-–—:]\s*|[([]\s*)([1-5])\s*[)\]]?\s*$/u;
const STAR = /[⭐★]/gu;

const EMOJI = /\p{Extended_Pictographic}|[️‍⃣]/gu;
const LEADING_BULLETS = /^[\s‎‏]*(?:[-–—•*>·▪️◦‣]+\s*)*/u;
const LEADING_NUMBER = /^\d{1,3}\s*(?:[-–—.)\]:]+\s*|\s+)/u;
const EDGE_PUNCT = /^[\s\-–—_*~.,;:!?/\\|]+|[\s\-–—_*~.,;:!?/\\|]+$/gu;

// Heurísticas de cabeçalho ("Racha sábado 19h ⚽") — só valem para linha SEM numeração;
// linha numerada é praticamente sempre um jogador.
const TIME_OF_DAY = /\b\d{1,2}[:h]\d{2}\b|\b\d{1,2}\s*(?:h|hs|hrs)\b/iu;
const WEEKDAY =
  /(?:^|\s)(?:segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|domingo)(?:-feira)?\b/iu;
const HEADER_FIRST_WORD =
  /^(?:racha|pelada|lista|confirmados?|resenha|jogo|futebol|society|futsal|resultado|local|data|hor[áa]rio|hoje|amanh[ãa]|galera|bora|quadra|campo)\b/iu;

// Negrito/itálico/tachado do WhatsApp nas bordas da linha: "*Goleiro:*", "_Linha_".
const WHATSAPP_STYLE = /^[*_~\s]+|[*_~\s]+$/gu;

// Seções de lista ("*Goleiro:*" ... "*Linha:*"): todo mundo abaixo de "Goleiro:"
// é goleiro até a próxima seção, mesmo sem marcador individual.
// Exige ":" ou a palavra sozinha — "Linha Silva" é jogador, "Linha:" é seção.
const SECTION_GK = /^goleiros?\s*(?::\s*|$)/iu;
const SECTION_FIELD = /^(?:linha|jogadores(?:\s+de\s+linha)?|na\s+linha)\s*(?::\s*|$)/iu;
// Lista de espera ("*Reservas:*", "Suplentes:", "Lista de espera:", "Próximos:"):
// todo mundo abaixo vira reserva (isReserve) até a próxima seção/cabeçalho.
const SECTION_RESERVE =
  /^(?:reservas?|suplentes?|(?:lista\s+de\s+)?espera|pr[óo]ximos?)\s*(?::\s*|$)/iu;

/**
 * Converte uma lista colada do WhatsApp em jogadores. Melhor-esforço: nunca lança
 * erro com entrada bagunçada; linhas sem nome reconhecível são ignoradas.
 * Regras documentadas em docs/04-algoritmo.md.
 */
export function parseList(text: string): Player[] {
  const players: Player[] = [];
  let section: "field" | "gk" = "field";
  // Dimensão independente da posição: dá pra ter goleiro reserva.
  let reserveSection = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const trimmed = rawLine.trim().replace(WHATSAPP_STYLE, "");
    if (!trimmed) continue;

    const unbulleted = trimmed.replace(LEADING_BULLETS, "");
    const wasNumbered = LEADING_NUMBER.test(unbulleted);
    let line = unbulleted.replace(LEADING_NUMBER, "");

    if (!wasNumbered) {
      if (SECTION_GK.test(line)) {
        section = "gk";
        reserveSection = false;
        line = line.replace(SECTION_GK, "");
        if (!/\p{L}/u.test(line)) continue; // "Goleiro:" puro; "Goleiro: Beto" segue
      } else if (SECTION_FIELD.test(line)) {
        section = "field";
        reserveSection = false;
        line = line.replace(SECTION_FIELD, "");
        if (!/\p{L}/u.test(line)) continue;
      } else if (SECTION_RESERVE.test(line)) {
        // Reserva é de linha por default; goleiro reserva precisa do marcador
        // individual ("Reservas:" + "Tonho (g)").
        section = "field";
        reserveSection = true;
        line = line.replace(SECTION_RESERVE, "");
        if (!/\p{L}/u.test(line)) continue;
      } else if (
        /:\s*$/.test(line) ||
        HEADER_FIRST_WORD.test(line) ||
        WEEKDAY.test(line) ||
        TIME_OF_DAY.test(line)
      ) {
        // Cabeçalho genérico ("Confirmados:", "Racha sábado 19h") encerra a seção.
        section = "field";
        reserveSection = false;
        continue;
      }
    }

    const isGoalkeeper =
      section === "gk" ||
      GK_PAREN.test(line) ||
      GK_WORD.test(line) ||
      GK_GLOVE.test(line);
    line = line
      .replace(GK_PAREN, " ")
      .replace(GK_WORD, " ")
      .replace(GK_GLOVE, " ");

    let skill = DEFAULT_SKILL;
    let skillExplicit = false;
    const stars = line.match(STAR);
    if (stars && stars.length > 0) {
      skill = clampSkill(stars.length);
      skillExplicit = true;
      line = line.replace(STAR, " ");
    } else {
      const match = line.match(TRAILING_SKILL);
      if (match) {
        skill = clampSkill(Number(match[1]));
        skillExplicit = true;
        line = line.slice(0, match.index);
      }
    }

    const name = line
      .replace(EMOJI, " ")
      .replace(/\s+/gu, " ")
      .replace(EDGE_PUNCT, "");

    // Precisa ter ao menos uma letra para ser um nome (descarta "⚽⚽", "---" etc.).
    if (!/\p{L}/u.test(name)) continue;

    players.push({
      id: `p${players.length}-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      skill,
      isGoalkeeper,
      skillExplicit,
      isReserve: reserveSection,
    });
  }

  return players;
}

function clampSkill(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SKILL;
  return Math.min(5, Math.max(1, Math.round(value)));
}
