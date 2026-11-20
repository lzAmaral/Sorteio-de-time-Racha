import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Obrigatório com `output: "export"` (ADR-0006): rota gerada no build.
export const dynamic = "force-static";

/**
 * Sitemap pela convenção do App Router (servido em /sitemap.xml).
 * O app tem rota única hoje; novas rotas entram aqui conforme as fases.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date("2026-11-20"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
