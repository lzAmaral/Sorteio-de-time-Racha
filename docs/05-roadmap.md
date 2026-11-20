# Roadmap

> Critério de passagem de fase: **cada fase só começa quando a anterior prova demanda.**
> Status marcado em cada item; agentes devem atualizar este arquivo ao concluir entregas.

> **As specs executáveis vivem nas issues do GitHub** — cada item das Fases 1–4 tem uma
> issue com contexto, escopo, critérios de aceite e notas técnicas, agrupadas por
> milestone (uma por fase): https://github.com/lzAmaral/Sorteio-de-time-Racha/issues
> Issues com a label `spec-pronta` estão prontas para um agente pegar e executar.

## Fase 0 — MVP do Sorteio ✅ (estruturado em 18/11/2026)

O produto da frase original: *"Cola a lista do grupo, define quantos times e pronto."*

- [x] Monorepo + pacote de domínio `@racha/core` com testes
- [x] Parser da lista do WhatsApp (números, emojis, goleiro, notas)
- [x] Sorteio equilibrado (greedy + hill-climbing) e aleatório
- [x] Cores de colete por time
- [x] Resultado pronto para o WhatsApp (copiar + wa.me)
- [x] Notas privadas persistidas no navegador (localStorage, por nome)

## Fase 1 — Polimento e lançamento público

Meta: organizadores reais usando toda semana. Métrica: sorteios/semana, % compartilha.

- [ ] Deploy (Vercel) + domínio próprio (decidir marca antes — ver [negócio](02-negocio.md))
- [x] PWA: manifest, ícone, offline (service worker) — "funciona na beira do campo"
- [ ] Compartilhar resultado como **imagem** (diferencial raro; validado no teammaker)
- [x] Ajuste manual pós-sorteio (tap-tap para trocar jogador entre times)
- [ ] Reservas/suplentes (quem chegou depois da lista fechar)
- [ ] Analytics de uso (ex.: Plausible/Umami — sem cookie banner)
- [ ] SEO básico da landing (sem brigar com FutBora por termos genéricos)
- [x] CI no GitHub Actions (test + build) e licença MIT — #8, PR #25

## Fase 2 — Racha gerenciado (retenção)

Meta: grupos ativos semanais. Gatilho: organizadores pedindo "salvar meu grupo".

- [ ] Supabase: auth leve (magic link/WhatsApp OTP), grupos salvos
- [ ] Presença ("joga hoje") com link para o grupo confirmar
- [ ] Histórico de partidas + registro de placar
- [ ] Rating evolutivo por resultados (Elo simplificado)
- [ ] Caixinha: quem pagou o racha do mês (controle manual primeiro, Pix depois)
- [ ] Restrições de sorteio (travar em time, manter separados)

## Fase 3 — Painel da Arena (monetização B2B) 💰

Meta: 2–3 quadras piloto (60 dias grátis) → 10 quadras pagantes (R$ 97–197/mês).

- [ ] App `apps/arena`: agenda de quadras em tela única
- [ ] Rachas da casa: a arena oferece racha gerenciado (lista + sorteio + cobrança)
- [ ] Mensalistas com cobrança individual via Pix (PSP: avaliar Asaas/Mercado Pago)
- [ ] Política de cancelamento + pré-pagamento de avulsos (anti no-show)
- [ ] Painel de ocupação e horários ociosos
- [ ] Material de venda: pitch de 10 min + case do piloto

## Fase 4 — Demanda nova (comissão)

Meta: preencher horário ocioso das quadras parceiras. Só faz sentido com Fase 3 rodando.

- [ ] Página pública da quadra com horários vagos
- [ ] Vaga avulsa em racha aberto (pagou, confirmou — modelo Elenko/Playtomic)
- [ ] Fila de espera com convite expirável
- [ ] Comissão 3–5% apenas sobre reservas originadas pela plataforma
