import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Obrigatório com `output: "export"` (ADR-0006): rota gerada no build.
export const dynamic = "force-static";

/**
 * robots.txt pela convenção do App Router (servido em /robots.txt).
 * Tudo é público e indexável; só o service worker fica fora do índice.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/sw.js"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
