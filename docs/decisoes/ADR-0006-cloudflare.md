# ADR-0006 — Infra: tudo Cloudflare (Pages + Workers + D1 + Durable Objects + better-auth)

- **Status:** aceita (20/11/2026, decisão do dono do projeto) — **substitui** o plano
  Vercel + Supabase citado no ADR-0002 e nas versões originais das issues #1/#9/#10.
- **Contexto:** o app é 100% estático e o link circula em grupos de WhatsApp (pico de
  banda imprevisível). Para a Fase 2+ precisamos de banco, auth de baixa fricção e
  realtime (presença ao vivo).
- **Decisão:** stack única na Cloudflare:
  1. **Hosting:** Cloudflare Pages (banda ilimitada no free tier, POPs no Brasil,
     preview deployments por PR). Domínio vaiterracha.app no Cloudflare Registrar
     (preço de custo); vaiterracha.com.br no registro.br apontando para a mesma zona.
  2. **Backend (Fase 2+):** Cloudflare Workers como API, **D1** (SQLite) como banco,
     **Durable Objects** para realtime/WebSocket (lista de presença ao vivo, fila de
     espera) e **better-auth** como camada de autenticação (magic link; adaptador D1/
     Drizzle), rodando no próprio Worker.
  3. **Analytics:** Cloudflare Web Analytics (grátis, sem cookies) para pageviews;
     eventos customizados via Worker simples gravando em D1 (issue #6).
- **Trade-offs assumidos:** auth e realtime dão mais trabalho do que no Supabase
  (que traz tudo pronto) — aceitamos a velocidade menor na Fase 2 em troca de custo
  quase zero em escala, um único provedor (domínio + DNS + CDN + compute + dados) e
  nenhuma taxa de egress. D1 é SQLite: suficiente para grupos/presença/histórico; se a
  Fase 3 (pagamentos da arena) exigir Postgres, reavaliar com novo ADR — o acesso a
  dados ficará isolado em `packages/db` justamente para permitir essa troca.
- **Consequências:** issues #1, #6, #9 e #10 reescritas para a nova stack; CI pode
  ganhar deploy automático via `wrangler`/Pages integração GitHub; nenhum impacto no
  `@racha/core` (puro) nem no modo local-first atual (ADR-0002 permanece válido para a
  camada grátis).
