# Negócio e Monetização

> Base factual: [pesquisa de mercado](pesquisa/01-mercado.md). Preços citados foram
> levantados em 18/11/2026.

## Tese

O B2C de sorteio é comoditizado (dezenas de apps grátis; teto R$ 20–25/mês). O dinheiro
está no B2B: donos de quadra já pagam **R$ 97–250/mês** por sistemas que só fazem agenda.
Um sistema que **gerencia o racha e garante o pagamento por jogador** entrega mais valor
do que qualquer agenda — e ninguém no Brasil fecha esse ciclo hoje (o Elenko promete,
mas ainda está em waitlist).

## Modelo de receita (evolução em 3 estágios)

### Estágio 1 — Grátis (aquisição e prova)
O sorteio é 100% grátis, sem cadastro. Objetivo: volume de organizadores usando toda
semana + lista de rachas/quadras da região. **Não monetiza e não deve monetizar** —
é o canal de aquisição mais barato possível (concorrentes já validaram isso).

### Estágio 2 — Organizador Pro (opcional, não prioritário)
Grupos salvos ilimitados, histórico, rating evolutivo, caixinha. Preço âncora do mercado:
FutBora R$ 19,90–24,90/mês. Só lançar se houver demanda espontânea — a função principal
dessa camada é **reter o organizador e conectá-lo à quadra parceira**, não gerar receita.

### Estágio 3 — Arena (o negócio de verdade)

| Plano | Preço alvo | O que entrega |
|---|---|---|
| **Arena Start** | R$ 97/mês | Agenda digital, página pública da quadra, rachas da casa com sorteio integrado |
| **Arena Pro** | R$ 197/mês | + Mensalistas com cobrança individual via Pix, controle de presença/no-show, painel de ocupação |
| **Comissão** | 3–5% | Só sobre reservas/vagas avulsas que **nós** trouxermos (modelo Playtomic: comissão apenas sobre demanda nova) |

Regra de ouro da pesquisa: **comissão sobre cliente que já era do dono é veneno**
(vários SaaS anunciam "sem comissão" como diferencial). Comissão só sobre demanda gerada.

### Matemática de referência
- 10 quadras × R$ 197 = R$ 1.970 MRR (validação do piloto)
- 50 quadras × ~R$ 150 médio = R$ 7.500 MRR + comissões (negócio regional saudável)
- Uma cidade média tem dezenas de arenas society; o mercado endereçável regional existe.

## Go-to-market (vantagem local)

1. **Semear o grátis** nos grupos de racha da região (o próprio dono do projeto joga —
   usar o produto no próprio racha é o teste de fogo).
2. **Venda direta porta-a-porta** nas arenas da região: demo de 10 minutos no celular do
   dono. Pitch: *"horário ocioso virando receita e mensalista pagando em dia"* — nunca
   "organize sua agenda".
3. **Piloto gratuito de 60 dias** com 2–3 quadras; medir ocupação antes/depois; virar case.
4. **Referral de organizador**: o organizador que leva o racha para uma quadra parceira
   ganha benefício (prioridade de horário, desconto na caixinha).

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Elenko lança antes com funding | Nossa vantagem é regional e de execução: grupo fechado + quadra parceira não precisa de liquidez de marketplace. Velocidade > escopo. |
| FutBora domina SEO do B2C | Não competir por SEO nacional; aquisição via grupos de zap locais + venda direta B2B |
| Dono de quadra resistente a tecnologia | Produto do dono tem que ser mais simples que o caderno: agenda em tela única, WhatsApp como canal de notificação |
| Inadimplência/no-show | Pré-pagamento Pix obrigatório para avulso confirmar vaga (padrão validado pelo mercado) |

## Nome e marca

**Decidido (20/11/2026): VaiTerRacha** — vaiterracha.app + vaiterracha.com.br (ambos
livres na checagem; registrar antes de divulgar). Racional e alternativas descartadas em
[ADR-0005](decisoes/ADR-0005-marca-vaiterracha.md). A frase "vai ter racha?" já vive nos
grupos e funciona para os dois lados: a pergunta da semana do jogador e a promessa para a
arena ("na sua quadra sempre vai ter racha").
