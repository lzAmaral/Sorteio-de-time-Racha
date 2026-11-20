/**
 * Fonte única de verdade do conteúdo público da landing (metadata, JSON-LD,
 * seções server-rendered, OG image, sitemap e robots).
 *
 * Estratégia de SEO (issue #7): não disputamos o termo genérico "sorteio de
 * times" — FutBora domina essa busca (docs/pesquisa/01-mercado.md). O objetivo
 * aqui é (1) converter quem chega pelo link compartilhado no grupo e (2) pegar
 * long-tail ("sorteio de times pra pelada pelo WhatsApp", "dividir times com
 * goleiro"). Por isso título com marca + FAQ indexável, não keyword stuffing.
 */

/**
 * Marca decidida em 20/11/2026 (ADR-0005): **VaiTerRacha**, domínio
 * vaiterracha.app (registro pendente — issue #1, deploy no Cloudflare Pages).
 * `NEXT_PUBLIC_SITE_URL` sobrescreve o fallback sem novo build manual.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vaiterracha.app";

export const SITE_NAME = "VaiTerRacha";
export const SITE_TITLE = "VaiTerRacha — sorteio de times equilibrados pro racha";
export const SITE_TAGLINE = "Cola a lista, define os times e pronto";
export const SITE_DESCRIPTION =
  "Cola a lista do grupo, define quantos times e pronto: sorteio equilibrado, cor de colete pra cada time e o resultado pronto pra mandar no zap. Grátis, sem cadastro.";

/** Os 3 passos do fluxo, repetidos em texto indexável abaixo da ferramenta. */
export const STEPS: { title: string; body: string }[] = [
  {
    title: "Cola a lista do grupo",
    body:
      "Do jeito que ela está no WhatsApp: numerada, com emoji, ✅, traço ou seção de goleiros. O app entende e monta a lista de jogadores.",
  },
  {
    title: "Define quantos times",
    body:
      "Escolha de 2 a 8 times e o tipo de sorteio: equilibrado (usa as notas que só você vê) ou aleatório, pura sorte.",
  },
  {
    title: "Manda no zap",
    body:
      "Cada time sai com uma cor de colete e o texto já formatado pra copiar e colar no grupo. Dá pra trocar jogador de time com dois toques.",
  },
];

export const FAQ: { question: string; answer: string }[] = [
  {
    question: "O sorteio é grátis?",
    answer:
      "Sim, e continua sendo. Sorteios ilimitados, sem anúncio e sem versão paga escondida: a camada de sorteio é grátis de propósito.",
  },
  {
    question: "Precisa de cadastro ou instalar app?",
    answer:
      "Não. Não tem login, e-mail nem download: abre no navegador do celular e você já cola a lista. Se quiser, dá pra adicionar à tela de início como atalho.",
  },
  {
    question: "As notas dos jogadores são privadas?",
    answer:
      "São. As notas ficam salvas só no seu navegador e nunca aparecem no resultado que você compartilha — ninguém do grupo descobre quanto você deu pra cada um.",
  },
  {
    question: "Funciona offline, na beira da quadra?",
    answer:
      "Funciona. Depois da primeira visita o app fica disponível sem internet, então o 4G ruim da quadra não trava o sorteio. Nada é enviado pra servidor nenhum.",
  },
  {
    question: "Como marca quem é goleiro?",
    answer:
      "Escreva (g), (gk), gol, goleiro ou 🧤 na linha do jogador, ou use uma seção \"Goleiros:\" na lista colada. Também é possível marcar com um toque na tela de revisão. O sorteio distribui os goleiros um por time.",
  },
  {
    question: "Quantos times e quantos jogadores dá pra sortear?",
    answer:
      "De 2 a 8 times, com pelo menos 2 jogadores por time, e sem limite de jogadores na lista. Se a divisão não for exata, o app avisa quais times ficam com um jogador a mais.",
  },
];

/** JSON-LD: FAQPage + WebApplication num só grafo, injetado na home. */
export function structuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        applicationCategory: "SportsApplication",
        operatingSystem: "Web (Android, iOS, desktop)",
        browserRequirements: "Requer um navegador com JavaScript",
        inLanguage: "pt-BR",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BRL",
        },
        featureList: [
          "Lê a lista colada do WhatsApp em qualquer formato",
          "Sorteio equilibrado por nota ou totalmente aleatório",
          "Goleiros distribuídos um por time",
          "Cor de colete para cada time",
          "Resultado formatado pronto pra enviar no WhatsApp",
          "Ajuste manual de jogador entre times",
          "Funciona offline (PWA), sem cadastro",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
}
