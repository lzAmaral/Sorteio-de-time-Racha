import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@racha/core"],
  // Site 100% estático servido pelo Cloudflare Pages (ADR-0006): o build gera
  // `out/` e o deploy é `wrangler pages deploy` — sem runtime de servidor.
  output: "export",
};

export default nextConfig;
