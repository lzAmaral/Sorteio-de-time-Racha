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
