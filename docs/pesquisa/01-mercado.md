# Pesquisa de Mercado — Sorteio de Racha e Gestão de Quadras

> Pesquisa realizada em 18/11/2026 (web + GitHub). Este documento é a base factual
> das decisões de produto e negócio. Fontes citadas ao longo do texto.

## 1. Análise do Elenko (referência direta)

O [Elenko](https://elenko.app/) é o projeto mais parecido com a nossa visão — e ainda
**não lançou o produto principal** (está em waitlist). Estrutura deles:

| Propriedade | O que é | Status |
|---|---|---|
| `elenko.app` | Site principal: trilha "Sou jogador" e "Tenho uma quadra" | Quadra marcada "Em breve" |
| `sorteio.elenko.app` | Sorteio de times grátis, sem cadastro (isca de topo de funil) | No ar |
| `peba.elenko.app` | Blog de conteúdo sobre racha | No ar |

**Funcionalidades prometidas (jogador):** descobrir jogos abertos por cidade/modalidade,
pagar a vaga no app (Pix/cartão) com confirmação automática, fila de espera com convite
expirável, avaliação anônima entre jogadores, sorteio equilibrado ponderado pelas
avaliações, perfil portátil com estatísticas.

**Funcionalidades prometidas (quadra):** cadastro de quadras com precificação por turno,
reserva confirmada só com pagamento, mensalistas com cobrança individual por jogador,
painel de ocupação e horários ociosos, perfil visível no marketplace.

**Monetização:** nenhum preço publicado. A arquitetura (pagamento in-app obrigatório)
sugere comissão sobre transação, estilo Playtomic.

**Fraquezas exploráveis:**
- O lado que monetiza (quadras) é o menos pronto — janela de tempo real.
- Marketplace exige liquidez cidade a cidade (ovo-e-galinha); um produto "grupo fechado
  + quadra parceira" não depende disso.
- SEO/awareness inexistente: quem domina busca em PT é o FutBora.

## 2. Concorrentes B2C (apps de pelada/racha)

Mercado **saturado e comoditizado**: dezenas de apps com o mesmo pacote
(presença + sorteio + ranking + caixinha), quase todos grátis ou freemium com teto
de ~R$ 20–25/mês cobrado do organizador.

| App | Destaques | Preço |
|---|---|---|
| [FutBora](https://futbora.com.br/) | PWA, 5 modos de sorteio (incl. IA), bot WhatsApp, placar por voz, SEO agressivo | Grátis; Premium R$ 19,90/mês; PRO R$ 24,90/mês |
| [Racha FC](https://apps.apple.com/br/app/racha-fc/id6780273949) | Cards estilo FIFA, caixinha, cronômetro sincronizado | Grátis; Pro US$ 4,99/mês |
| [Fut7Pro](https://www.fut7pro.com.br/) | SaaS p/ "presidentes" de racha: site público do racha, patrocinadores, mensalistas | Pago (valores não publicados) |
| [Pelada Pro](https://peladaproapp.com.br/) | Sorteio por habilidade offline, sem cadastro | Grátis |
| [Pelada Sem Craque](https://www.peladasemcraque.com.br/) | Nível técnico + posição | Grátis |
| [Chega+](https://www.chegamais.app/), [Bora!FC](https://www.borafc.app.br/), Racha Alpha, MontaTime, Peladaí, Lineup… | Cauda longa de clones | Freemium |

**Conclusão B2C:** não dá para construir negócio relevante cobrando do organizador de
pelada. A ferramenta de sorteio deve ser **grátis e excelente** — é canal de aquisição,
não produto.

## 3. Mercado B2B (sistemas para donos de quadra/arena)

Cluster de preço validado no Brasil: **R$ 97–250/mês**, precificado por número de quadras.
Extremos: R$ 27/mês (AgendaQuadras) a R$ 399/mês (Atacante ilimitado).

| Sistema | Preço/mês | Modelo |
|---|---|---|
| [AgendaQuadras](https://www.javenessi.com.br/produtos/centroesportes/PortalInstitucional/index.html) | R$ 27–49 | Agenda simples |
| [WebArena](https://webarena.app/) | R$ 60–180 | Por nº de quadras |
| [ArenaSys](https://arenasys.com.br/about) | a partir de R$ 97 | SaaS |
| [Sistema de Agenda](https://www.sistemadeagenda.com.br/sistema-para-society.html) | R$ 99–249 | "Sem comissão" como diferencial |
| [Partiu Play](https://www.partiuplay.com.br/) | R$ 139,90 | SaaS |
| [ArenaGame](https://arenagame.com.br/) | R$ 147–297 | SaaS |
| [Arena Online](https://arenaonline.app.br/) | R$ 197 | SaaS |
| [Atacante.app](https://atacante.app/sistema-para-society/) | R$ 199–399 | Por quadras |
| [Arena App](https://arenaapp.app.br/) | Grátis–R$ 259,90 | Freemium |
| [Agendei Quadras](https://www.agendeiquadras.com.br/appAgendei/) | n/d | Marketplace + gestor (tem sorteio embutido) |

**Dores documentadas dos donos de quadra** (fontes: societygo.com.br, atacante.app,
reservaai.com.br, totalgrass.com.br):
1. **No-show / furo de reserva avulsa** — perda financeira direta; mitigada por pré-pagamento.
2. Gestão manual via WhatsApp/caderno.
3. **Horários ociosos** fora do prime time.
4. Fidelização de mensalistas.

**Referência internacional:** [Playtomic](https://mk-ventas.blog/marketing/casos-de-exito/playtomic/)
cobra SaaS dos clubes + ~4% de comissão sobre reservas + até ~20% em partidas abertas
(quando é ela que traz a demanda). Lição-chave: **comissão só é aceita quando a plataforma
traz cliente novo**; vários SaaS brasileiros anunciam "sem comissão" como diferencial.
Playtomic foca esportes de raquete e previu expansão no Brasil ~2027 — o society segue
fragmentado. Janela aberta.

## 4. A lacuna (nossa oportunidade)

> Os apps de pelada ignoram a quadra; os SaaS de quadra ignoram o racha.
> **Ninguém fecha o ciclo "racha recorrente + cobrança individual por jogador +
> agenda da arena + preenchimento de horário ocioso".**

Oportunidades concretas, em ordem de força:
1. **Cobrança individual do racha** — o organizador que "banca o horário" e corre atrás
   do Pix de 14 pessoas é a dor mais citada no funil de conteúdo do setor. Split de
   pagamento por jogador com garantia para a arena é a cunha de entrada.
2. **Preenchimento de horário ocioso** — matchmaking de avulsos para encher horário
   vazio, monetizável por comissão (modelo Playtomic), inexistente para society no Brasil.
3. **Racha como produto da arena** — o dono de quadra oferece "racha gerenciado" como
   serviço (lista, sorteio, cobrança), fidelizando mensalistas.

## 5. Algoritmos de balanceamento (estado da arte e da prática)

1. **Snake draft por rating** (ordena por nota, distribui 1→N, N→1): padrão do mercado,
   simples e explicável. Variante por posição (goleiros à parte).
2. **Partição ótima**: para ≤ ~16 jogadores dá para buscar a partição de menor diferença
   de soma de skills; acima disso, snake draft + trocas locais (hill climbing).
3. **Ratings probabilísticos**: Elo/Glicko/[TrueSkill 2](https://www.microsoft.com/en-us/research/uploads/prod/2018/03/trueskill2.pdf)
   — skill como distribuição atualizada por resultados.
4. **Prática dos apps BR**: notas 1–5 privadas do organizador, goleiros tratados à parte,
   ajuste manual pós-sorteio. **Mais importante que o algoritmo é a percepção de justiça
   e a explicabilidade.**

## 6. Implicações para o nosso produto

1. Sorteio grátis, sem cadastro, melhor da categoria → aquisição (igual Elenko/FutBora,
   mas dá para vencer em UX: o fluxo "cola a lista do zap → resultado pronto pro zap" tem
   que ser < 30 segundos).
2. Monetizar no B2B: dono de quadra paga R$ 97–197/mês por um sistema que além de agenda
   **gerencia o racha e garante o pagamento** — valor acima de qualquer agenda pura.
3. Não depender de liquidez de marketplace no início: modelo "grupo fechado + quadra
   parceira" funciona com 1 quadra e 1 racha.
4. Notas privadas do organizador + sorteio explicável + ajuste manual = percepção de justiça.
