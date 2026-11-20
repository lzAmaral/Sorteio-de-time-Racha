import type { Team } from "@racha/core";

/**
 * Card de imagem do resultado (issue #3), desenhado em canvas puro — sem
 * html-to-image: o layout é simples (cabeçalho + N listas) e assim não há
 * bug de fonte/CORS nem dependência nova.
 *
 * REGRA INEGOCIÁVEL: as notas dos jogadores NUNCA entram na imagem
 * (nota é privada do organizador — ADR-0003). Só nome, posição e colete.
 */

/** Medidas do card, em pixels da imagem final (largura fixa de 1080). */
export interface ResultImageMetrics {
  width: number;
  padding: number;
  titleSize: number;
  subtitleSize: number;
  /** Faixa colorida no topo de cada bloco de time. */
  bandHeight: number;
  teamNameSize: number;
  countSize: number;
  /** Respiro vertical entre a faixa e a primeira/última linha da lista. */
  listPaddingY: number;
  rowHeight: number;
  playerSize: number;
  goalkeeperSize: number;
  blockGap: number;
  headerGap: number;
  footerGap: number;
  footerSize: number;
  radius: number;
  /** Deslocamento horizontal do número e do nome dentro do bloco. */
  numberWidth: number;
  rowPaddingX: number;
}

export const RESULT_IMAGE_METRICS: ResultImageMetrics = {
  width: 1080,
  padding: 56,
  titleSize: 72,
  subtitleSize: 32,
  bandHeight: 104,
  teamNameSize: 46,
  countSize: 28,
  listPaddingY: 28,
  rowHeight: 74,
  playerSize: 42,
  goalkeeperSize: 28,
  blockGap: 32,
  headerGap: 44,
  footerGap: 52,
  footerSize: 26,
  radius: 28,
  numberWidth: 58,
  rowPaddingX: 36,
};

export interface PlayerRowLayout {
  /** Topo da linha. */
  y: number;
  height: number;
  /** Posição na lista do time, começando em 1. */
  index: number;
  name: string;
  isGoalkeeper: boolean;
}

export interface TeamBlockLayout {
  /** Topo do bloco (começo da faixa colorida). */
  y: number;
  height: number;
  bandHeight: number;
  /** "TIME PRETO" */
  name: string;
  /** "6 jogadores" */
  countLabel: string;
  hex: string;
  textHex: string;
  rows: PlayerRowLayout[];
}

export interface ResultImageLayout {
  width: number;
  height: number;
  metrics: ResultImageMetrics;
  title: { text: string; y: number };
  subtitle: { text: string; y: number };
  blocks: TeamBlockLayout[];
  footer: { text: string; y: number };
}

export interface ResultImageOptions {
  title?: string;
  /** Data por extenso. Default: hoje, formatado em pt-BR. */
  subtitle?: string;
  footer?: string;
  metrics?: Partial<ResultImageMetrics>;
}

const DEFAULT_TITLE = "SORTEIO DO RACHA";
const DEFAULT_FOOTER = "VaiTerRacha · vaiterracha.app";

/** "quinta-feira, 20 de novembro de 2026" (com a inicial maiúscula). */
export function dateLabel(date = new Date()): string {
  const text = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Parte PURA do renderer: dado os times, calcula posição e altura de cada
 * elemento do card. Sem canvas, sem DOM — é o que define o visual e o que dá
 * para conferir de cabeça (ou testar, quando o web tiver runner de teste).
 */
export function layoutResultImage(
  teams: readonly Team[],
  options: ResultImageOptions = {},
): ResultImageLayout {
  const m = { ...RESULT_IMAGE_METRICS, ...options.metrics };
  const title = options.title ?? DEFAULT_TITLE;
  const subtitle = options.subtitle ?? dateLabel();
  const footer = options.footer ?? DEFAULT_FOOTER;

  let y = m.padding;

  const titleY = y;
  y += m.titleSize * 1.1;

  const subtitleY = y;
  y += m.subtitleSize * 1.3 + m.headerGap;

  const blocks: TeamBlockLayout[] = teams.map((team) => {
    const blockY = y;
    const listTop = blockY + m.bandHeight + m.listPaddingY;
    const rows: PlayerRowLayout[] = team.players.map((player, i) => ({
      y: listTop + i * m.rowHeight,
      height: m.rowHeight,
      index: i + 1,
      name: player.name,
      isGoalkeeper: player.isGoalkeeper,
    }));
    const height =
      m.bandHeight + m.listPaddingY * 2 + team.players.length * m.rowHeight;
    y += height + m.blockGap;
    return {
      y: blockY,
      height,
      bandHeight: m.bandHeight,
      name: `TIME ${team.vest.name.toUpperCase()}`,
      countLabel: `${team.players.length} ${
        team.players.length === 1 ? "jogador" : "jogadores"
      }`,
      hex: team.vest.hex,
      textHex: team.vest.textHex,
      rows,
    };
  });

  if (blocks.length > 0) y -= m.blockGap;
  y += m.footerGap;

  const footerY = y;
  y += m.footerSize * 1.2;

  return {
    width: m.width,
    height: Math.round(y + m.padding),
    metrics: m,
    title: { text: title, y: titleY },
    subtitle: { text: subtitle, y: subtitleY },
    blocks,
    footer: { text: footer, y: footerY },
  };
}

/**
 * Cores do card — tema claro zinc do app. O fundo é um tom abaixo do cartão
 * (zinc-100 x branco) pra que o colete branco não suma dentro da imagem.
 */
const COLORS = {
  background: "#f4f4f5",
  card: "#ffffff",
  border: "#e4e4e7",
  title: "#18181b",
  muted: "#71717a",
  number: "#a1a1aa",
  bandDivider: "rgba(0, 0, 0, 0.08)",
};

function fontFamily(): string {
  if (typeof document !== "undefined") {
    const family = getComputedStyle(document.body).fontFamily;
    if (family) return family;
  }
  return "system-ui, -apple-system, sans-serif";
}

function font(size: number, weight: number, family: string): string {
  return `${weight} ${size}px ${family}`;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: [number, number, number, number],
) {
  const [tl, tr, br, bl] = radii;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

/** Corta o nome com "…" se ele não couber na largura disponível. */
function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > max) {
    cut = cut.slice(0, -1);
  }
  return `${cut}…`;
}

/** Desenha o card no contexto 2D, nas posições calculadas por `layoutResultImage`. */
export function drawResultImage(
  ctx: CanvasRenderingContext2D,
  layout: ResultImageLayout,
) {
  const { metrics: m } = layout;
  const family = fontFamily();
  const contentWidth = layout.width - m.padding * 2;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, layout.width, layout.height);
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  ctx.fillStyle = COLORS.title;
  ctx.font = font(m.titleSize, 700, family);
  ctx.fillText(layout.title.text, m.padding, layout.title.y);

  ctx.fillStyle = COLORS.muted;
  ctx.font = font(m.subtitleSize, 400, family);
  ctx.fillText(layout.subtitle.text, m.padding, layout.subtitle.y);

  for (const block of layout.blocks) {
    // Cartão do time: fundo branco + borda, cantos arredondados.
    roundRectPath(ctx, m.padding, block.y, contentWidth, block.height, [
      m.radius,
      m.radius,
      m.radius,
      m.radius,
    ]);
    ctx.fillStyle = COLORS.card;
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Faixa na cor do colete (só os cantos de cima arredondados).
    ctx.save();
    roundRectPath(ctx, m.padding, block.y, contentWidth, block.bandHeight, [
      m.radius,
      m.radius,
      0,
      0,
    ]);
    ctx.clip();
    ctx.fillStyle = block.hex;
    ctx.fillRect(m.padding, block.y, contentWidth, block.bandHeight);
    ctx.restore();

    // Divisória sutil: garante contorno mesmo no colete branco.
    ctx.fillStyle = COLORS.bandDivider;
    ctx.fillRect(
      m.padding,
      block.y + block.bandHeight - 2,
      contentWidth,
      2,
    );

    const bandTextY =
      block.y + (block.bandHeight - m.teamNameSize * 1.15) / 2;
    ctx.fillStyle = block.textHex;
    ctx.font = font(m.teamNameSize, 700, family);
    ctx.fillText(block.name, m.padding + m.rowPaddingX, bandTextY);

    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.textAlign = "right";
    ctx.font = font(m.countSize, 500, family);
    ctx.fillText(
      block.countLabel,
      layout.width - m.padding - m.rowPaddingX,
      block.y + (block.bandHeight - m.countSize * 1.2) / 2,
    );
    ctx.restore();
    ctx.textAlign = "left";

    for (const row of block.rows) {
      const textY = row.y + (row.height - m.playerSize * 1.15) / 2;
      const numberRight = m.padding + m.rowPaddingX + m.numberWidth;

      ctx.fillStyle = COLORS.number;
      ctx.font = font(m.playerSize * 0.72, 500, family);
      ctx.textAlign = "right";
      ctx.fillText(
        `${row.index}.`,
        numberRight,
        row.y + (row.height - m.playerSize * 0.72 * 1.2) / 2,
      );
      ctx.textAlign = "left";

      const nameX = numberRight + 22;
      const suffix = row.isGoalkeeper ? " (goleiro)" : "";
      ctx.font = font(m.goalkeeperSize, 500, family);
      const suffixWidth = suffix ? ctx.measureText(suffix).width : 0;
      const nameMax =
        layout.width - m.padding - m.rowPaddingX - nameX - suffixWidth;

      ctx.fillStyle = COLORS.title;
      ctx.font = font(m.playerSize, 600, family);
      const name = fit(ctx, row.name, nameMax);
      ctx.fillText(name, nameX, textY);

      if (suffix) {
        const nameWidth = ctx.measureText(name).width;
        ctx.fillStyle = COLORS.muted;
        ctx.font = font(m.goalkeeperSize, 500, family);
        ctx.fillText(
          suffix,
          nameX + nameWidth,
          row.y + (row.height - m.goalkeeperSize * 1.3) / 2 + 6,
        );
      }
    }
  }

  ctx.fillStyle = COLORS.muted;
  ctx.font = font(m.footerSize, 500, family);
  ctx.textAlign = "center";
  ctx.fillText(layout.footer.text, layout.width / 2, layout.footer.y);
  ctx.textAlign = "left";
}

/** Gera o PNG do resultado atual (inclui as trocas manuais já aplicadas). */
export async function renderResultImage(
  teams: readonly Team[],
  options: ResultImageOptions = {},
): Promise<Blob> {
  const layout = layoutResultImage(teams, options);
  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d indisponível");

  drawResultImage(ctx, layout);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("falha ao gerar o PNG");
  return blob;
}

export const RESULT_IMAGE_FILENAME = "sorteio-do-racha.png";

/**
 * Share nativo quando o navegador aceita arquivo (Chrome Android, Safari iOS);
 * senão baixa o PNG (desktop). Retorna como o arquivo saiu, para a UI avisar.
 */
export async function shareResultImage(
  blob: Blob,
  fileName = RESULT_IMAGE_FILENAME,
): Promise<"compartilhado" | "baixado"> {
  const file = new File([blob], fileName, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: "VaiTerRacha",
      });
      return "compartilhado";
    } catch (error) {
      // Usuário fechou a folha de compartilhamento: não é erro, nem baixa.
      if (error instanceof DOMException && error.name === "AbortError") {
        return "compartilhado";
      }
      // Qualquer outra falha do share nativo cai no download.
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  return "baixado";
}
