import type { MetadataRoute } from "next";

// Obrigatório com `output: "export"` (ADR-0006): rota gerada no build.
export const dynamic = "force-static";

/**
 * Manifest do PWA (convenção do App Router — servido em /manifest.webmanifest).
 * Os ícones vêm de `public/icons/`, gerados por `npm run icons`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VaiTerRacha — sorteio do racha",
    short_name: "VaiTerRacha",
    description:
      "Cola a lista do grupo, define quantos times e pronto: sorteio equilibrado, cor de colete pra cada time e o resultado pronto pra mandar no zap.",
    lang: "pt-BR",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#fafafa",
    background_color: "#fafafa",
    categories: ["sports", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
