import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/**
 * OG image pela convenção do App Router (servida em /opengraph-image.png).
 *
 * É a peça de marketing mais vista do produto: é ela que aparece quando o link
 * cai no grupo do WhatsApp (issue #7). Gerada **no build** — a rota é
 * prerenderizada como arquivo estático, então o site segue 100% estático e sem
 * runtime de imagem em produção (nada de `runtime = "edge"`).
 *
 * O desenho repete o logo mark do produto (camisa branca do lucide `Shirt`
 * sobre quadrado preto arredondado), igual ao header e aos ícones do PWA.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;

const BG = "#fafafa"; // zinc-50, o fundo do app
const INK = "#18181b"; // zinc-900 ≈ --primary
const MUTED = "#71717a"; // zinc-500 ≈ --muted-foreground

/**
 * Logo mark como data URI: o satori não renderiza `<svg>` inline com `<g>`,
 * mas aceita SVG via `<img src="data:image/svg+xml,...">`.
 */
const SHIRT_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96" fill="none" stroke="${BG}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: BG,
          padding: "0 96px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 168,
            height: 168,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 36,
            background: INK,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- satori só aceita <img> */}
          <img src={SHIRT_DATA_URI} width={96} height={96} alt="" />
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -3,
            color: INK,
          }}
        >
          {SITE_NAME}
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 44,
            letterSpacing: -1,
            color: MUTED,
          }}
        >
          {SITE_TAGLINE}
        </div>

        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: MUTED,
          }}
        >
          <span>Grátis</span>
          <span>·</span>
          <span>sem cadastro</span>
          <span>·</span>
          <span>funciona offline</span>
        </div>
      </div>
    ),
    size,
  );
}
