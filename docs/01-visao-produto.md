# Visão de Produto

## O produto em uma frase

**Cola a lista do grupo, define quantos times e pronto: sorteio equilibrado, cor de
colete pra cada time e o resultado pronto pra mandar no zap.**

Esse é o núcleo — e também a porta de entrada para um negócio B2B: vender para donos
de quadra da região um sistema que transforma o racha em receita previsível.

## Estratégia em três camadas (funil)

```
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 1 — Sorteio grátis (aquisição)                       │
│ Web, sem cadastro. Cola a lista → times equilibrados →      │
│ coletes → copiar/enviar no WhatsApp. < 30 segundos.         │
├─────────────────────────────────────────────────────────────┤
│ CAMADA 2 — Racha gerenciado (retenção do organizador)       │
│ Grupo salvo, notas privadas, presença, histórico,           │
│ caixinha/cobrança por jogador via Pix. Freemium.            │
├─────────────────────────────────────────────────────────────┤
│ CAMADA 3 — Painel da arena (monetização B2B)                │
│ Dono de quadra: agenda, rachas da casa, mensalistas com     │
│ cobrança individual, preenchimento de horário ocioso.       │
│ Assinatura R$ 97–197/mês + comissão sobre demanda nova.     │
└─────────────────────────────────────────────────────────────┘
```

A pesquisa ([pesquisa/01-mercado.md](pesquisa/01-mercado.md)) mostra por quê:
a Camada 1 é comoditizada (não se cobra por ela), a Camada 3 é onde o dinheiro está
(cluster validado R$ 97–250/mês), e a Camada 2 é o que conecta as duas — o racha do
organizador acontece numa quadra, e é o organizador quem leva o produto para o dono.

## Personas

1. **O Organizador (Camada 1–2)** — monta a lista no WhatsApp toda semana, sorteia os
   times "de cabeça", banca o horário e corre atrás do Pix de 14 pessoas. Dor: tempo,
   reclamação de time desequilibrado, calote.
2. **O Dono de Quadra (Camada 3)** — administra 1–5 quadras society/futsal, agenda no
   caderno ou WhatsApp. Dores (documentadas na pesquisa): no-show de avulsos, horário
   ocioso fora do prime time, fidelizar mensalistas.
3. **O Jogador** — só quer saber: que horas, qual time, qual colete, quanto paga.

## Princípios de produto

1. **O zap é o cliente.** Entrada: lista colada do WhatsApp em qualquer formato (números,
   emojis, traços). Saída: texto formatado pronto para colar de volta. Nunca forçar o
   grupo a migrar de plataforma.
2. **Zero fricção na camada grátis.** Sem cadastro, sem app para instalar (PWA), funciona
   no navegador do celular.
3. **Justiça percebida > algoritmo perfeito.** Notas privadas do organizador, sorteio
   explicável, re-sorteio e ajuste manual a um toque.
4. **O dono da quadra ganha dinheiro com a gente ou não paga.** O pitch B2B não é
   "organize sua agenda", é "horário ocioso virando receita e mensalista pagando em dia".

## Diferencial vs. Elenko

| | Elenko | Nós |
|---|---|---|
| Estratégia | Marketplace dois lados (precisa de liquidez por cidade) | Grupo fechado + quadra parceira (funciona com 1 quadra) |
| Status | Waitlist; lado quadra "em breve" | Executar rápido o que eles prometem |
| Go-to-market | Orgânico/nacional | Venda direta a donos de quadra da região (relacionamento local) |
| Monetização | Comissão sobre transação (aparente) | Assinatura B2B + comissão só sobre demanda nova |

## Métricas norte

- Camada 1: sorteios realizados/semana; % que compartilha no WhatsApp; % que salva o grupo.
- Camada 2: grupos ativos semanais (um racha é semanal por natureza — retenção é binária).
- Camada 3: quadras pagantes; MRR; taxa de ocupação das quadras parceiras.
