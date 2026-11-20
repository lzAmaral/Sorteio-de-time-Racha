# ADR-0002 — Local-first: MVP sem backend, sem cadastro

- **Status:** aceita (18/11/2026)
- **Contexto:** a camada grátis é canal de aquisição e precisa de fricção zero (lição do
  sorteio.elenko.app e do FutBora); o organizador usa o produto na beira do campo com 4G
  ruim; o projeto OSS teammaker provou que o fluxo completo funciona sem servidor.
- **Decisão:** o MVP roda 100% no navegador. Estado em React + `localStorage`:
  - `racha:notas` — mapa `nome (minúsculo) → { skill, goleiro }`: as notas privadas do
    organizador sobrevivem entre sessões e são reaplicadas ao colar a lista da semana.
  - `racha:config` — último nº de times/modo.
  Nenhum dado sai do dispositivo; nenhuma conta é criada.
- **Gatilho de reversão:** quando usuários pedirem "salvar meu grupo"/sync entre
  dispositivos (Fase 2), entra **Supabase** (escolha unânime dos projetos OSS que
  evoluíram: auth + Postgres + RLS) — mantendo o modo anônimo funcionando.
- **Consequências:** deploy estático barato (Vercel free tier), privacidade por padrão
  (nota de jogador é dado sensível socialmente!), e o core precisa continuar puro para
  rodar no cliente.
