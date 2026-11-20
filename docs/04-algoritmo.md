# Algoritmo: Parser da Lista e Sorteio Equilibrado

> Princípio norteador (da pesquisa): **percepção de justiça e explicabilidade valem mais
> que otimalidade matemática.** O organizador precisa conseguir explicar o resultado e
> ajustar quando discordar.

## 1. Parser da lista do WhatsApp (`parser.ts`)

Entrada: texto colado em qualquer formato típico de lista de racha. Regras por linha:

| Regra | Exemplo de entrada | Interpretação |
|---|---|---|
| Numeração/bullets removidos | `1. João`, `3- Pedro`, `• Lucas`, `10) Rafa` | nome limpo |
| Marcador de goleiro | `Carlão (g)`, `Dudu gk`, `Max 🧤`, `Beto goleiro` | `isGoalkeeper: true` |
| Nota explícita | `João - 4`, `Pedro (5)`, `Lucas ⭐⭐⭐` | `skill` 1–5 |
| Sem nota | `Marcos` | `skill: 3` (neutro) |
| Cabeçalhos ignorados | `Confirmados:`, `Racha sábado 19h ⚽` | linha pulada se: termina em `:`, não tem letras após limpeza, **ou** (linha sem numeração E começa com palavra de cabeçalho / contém dia da semana ou horário). Linha numerada nunca é cabeçalho. |
| Emojis decorativos | `🔥 Bruno 🔥`, `Massuia✅` | removidos do nome |
| Negrito do WhatsApp | `*Goleiro:*`, `_Linha_` | `*`/`_`/`~` das bordas removidos |
| Seções | `*Goleiro:*` seguido de nomes, depois `*Linha:*` | todos abaixo de "Goleiro:" são goleiros até a próxima seção; cabeçalho genérico encerra a seção |
| Seção de espera | `*Reservas:*`, `Suplentes:`, `Lista de espera:`, `Espera`, `Próximos:` | todos abaixo viram `isReserve: true` até a próxima seção/cabeçalho genérico |

Invariantes: nunca lançar erro com entrada bagunçada (parse é melhor-esforço); nomes
duplicados são permitidos (dois "João" existem na vida real); ordem de entrada preservada.

## 2. Sorteio equilibrado (`balancer.ts`)

Modo `balanced` (padrão), em 4 etapas:

```
1. GOLEIROS PRIMEIRO
   Embaralha os goleiros e aloca 1 por time (times em ordem aleatória).
   Goleiros excedentes voltam ao pool como jogadores de linha.

2. SEED GREEDY COM ALEATORIEDADE
   Embaralha o pool (desempates ficam aleatórios → re-sorteio varia),
   ordena por skill decrescente (sort estável preserva o embaralhado nos empates),
   e atribui cada jogador ao time com menor soma de skill que ainda tenha vaga.
   Capacidade: tamanhos diferem em no máximo 1; quem recebe a vaga extra é aleatório.

3. HILL-CLIMBING DE TROCAS
   Enquanto houver melhoria: testa trocas par-a-par entre times
   (goleiro só troca com goleiro) e aplica toda troca que reduza o
   spread = (maior média de time) − (menor média de time).
   Convergência típica em poucas iterações; teto de segurança de iterações.

4. APRESENTAÇÃO
   Goleiro listado primeiro em cada time; cores de colete na ordem da paleta.
```

Modo `random`: goleiros 1 por time + round-robin embaralhado (sem etapas 2–3).

**Por que média e não soma?** Com times de tamanhos diferentes (ex.: 11 jogadores em
2 times), soma penalizaria o time maior. Média mantém a comparação justa.

**Por que não busca exaustiva?** Para 2 times de até ~8 ela é viável e dá o ótimo global
(abordagem do sm-fairplay, ver [pesquisa OSS](pesquisa/02-github-oss.md)) — é uma
otimização futura. O greedy + trocas chega a espread ≤ 1 nível em praticamente todos os
casos reais, com código simples e explicável.

## 2.1 Ajuste manual pós-sorteio (`swap.ts`)

O organizador dá a palavra final (issue #4): `swapPlayers(teams, idA, idB)` troca dois
jogadores de times diferentes e devolve um **novo** array de times (entrada nunca é
mutada), reaplicando a ordem de apresentação (goleiro primeiro).

| Caso | Comportamento |
|---|---|
| Linha ↔ linha de times diferentes | troca aplicada |
| Goleiro ↔ goleiro de times diferentes | troca aplicada (mantém 1 goleiro por time) |
| Goleiro ↔ linha | recusa, `code: "posicao-incompativel"` |
| Mesmo time (ou o mesmo jogador) | recusa, `code: "mesmo-time"` |
| Id que não está em nenhum time | recusa, `code: "jogador-nao-encontrado"` |

**Decisão de API:** caso inválido **lança** `SwapError` (erro tipado com `code`), porque
troca inválida é bug de chamada, não fluxo esperado. Para a UI precisar apenas *saber* se
pode trocar — pintar quem está indisponível, dar feedback de bloqueado — existe
`canSwap(teams, idA, idB)`, que retorna resultado discriminado
(`{ ok: true } | { ok: false; code; message }`) sem lançar.

Na web o ajuste é **tap-tap** (sem drag-and-drop: ruim no mobile): 1º toque seleciona,
toque em alguém de outro time troca, toque no mesmo jogador cancela. "Sortear de novo"
recalcula a partir da lista e descarta os ajustes manuais.

## 2.2 Reservas / lista de espera (`reserves.ts`)

A lista fecha com 21 e aparecem 24 (issue #5). Quem está de fora leva
`isReserve: true` no `Player` — estado **da partida**, não atributo do jogador (não é
persistido junto com a nota no `localStorage`).

| Peça | Contrato |
|---|---|
| `splitReserves(players)` | função pura → `{ active, reserves }`, preservando a ordem original dos dois lados (lista de espera = ordem de chegada) |
| `drawTeams(players, opts)` | **assinatura inalterada** (`Team[]`): descarta reservas internamente, então reserva nunca entra em time nem conta na validação de jogadores insuficientes |
| `formatWhatsApp(teams, { reserves })` | opção nova; com lista não vazia, acrescenta a seção `⏳ *RESERVAS*` numerada depois dos times e antes do rodapé |

**Decisão de API:** `drawTeams` continua devolvendo `Team[]` (não virou
`{ teams, reserves }`) para não quebrar os chamadores existentes; quem precisa da lista
de espera chama `splitReserves`. O filtro acontece nos dois lados — a UI passa só os
ativos *e* o balancer filtra de novo — porque "reserva não entra em time" é invariante de
domínio, não detalhe de tela.

Na web o toggle de reserva vive no passo 1, ao lado do toggle de goleiro: **um toque
rebaixa, outro promove** (é o mesmo botão), e o aviso de tamanho dos times no passo 2
recalcula na hora, contando só os ativos. No resultado as reservas aparecem numa seção
própria depois dos times — sem tap-tap: promover/rebaixar é sempre no passo 1, para não
competir com a troca manual (§2.1), que usa o toque no jogador.

## 3. Saída para o WhatsApp (`formatter.ts` + `vests.ts`)

Paleta de coletes na ordem: Preto 🖤, Branco 🤍, Laranja 🧡, Azul 💙, Verde 💚,
Vermelho ❤️, Amarelo 💛, Roxo 💜 (cores de colete que existem de verdade nas quadras).

Formato de saída (notas **nunca** aparecem — princípio: a nota é privada do organizador):

```
⚽ *SORTEIO DO RACHA* ⚽

🖤 *TIME PRETO*
1. Carlão 🧤
2. João
3. Pedro

🤍 *TIME BRANCO*
1. Max 🧤
2. Lucas
3. Rafa

⏳ *RESERVAS*
1. Tonho
2. Zé 🧤

_Sorteado em segundos — bora pro jogo!_
```

## 4. Evolução futura do rating (Fase 2+)

- **Rating evolutivo**: registrar resultado da partida e ajustar notas (estilo Elo
  simplificado, ± pequeno delta por vitória + delta por saldo de gols — abordagem
  validada no dezGusty/team-balancer). Resolve "o time do Fulano sempre ganha".
- **Restrições manuais**: travar jogador em time, "esses dois sempre separados"
  (lacuna de mercado identificada; implementar como constraints no hill-climbing:
  troca que viola restrição é descartada).
- **Notas colaborativas anônimas** (modelo Elenko): média das avaliações do grupo
  substitui a nota do organizador quando ativada.
