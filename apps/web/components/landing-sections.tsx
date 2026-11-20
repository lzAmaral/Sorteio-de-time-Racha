import { ChevronDown } from "lucide-react";
import { FAQ, STEPS } from "@/lib/site";

/**
 * Conteúdo da landing abaixo da ferramenta (issue #7).
 *
 * São Server Components puros, sem `"use client"` e sem estado: o HTML já sai
 * pronto no build, indexável, e nenhum KB de JS é adicionado ao bundle. O FAQ
 * usa `<details>`/`<summary>` nativos justamente para expandir sem JavaScript.
 *
 * Princípio que não pode ser quebrado: a ferramenta É a landing. Tudo aqui vive
 * *depois* do `<main>`, abaixo da dobra — nada se interpõe entre o usuário e o
 * textarea de colar a lista.
 */

export function ComoFunciona() {
  return (
    <section
      aria-labelledby="como-funciona"
      className="border-t border-border/60 pt-7"
    >
      <h2
        id="como-funciona"
        className="text-[13px] font-semibold tracking-tight text-muted-foreground"
      >
        Como funciona
      </h2>
      <ol className="mt-4 space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold tabular-nums text-secondary-foreground"
            >
              {i + 1}
            </span>
            <div className="leading-snug">
              <h3 className="text-sm font-medium tracking-tight">
                {step.title}
              </h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PerguntasFrequentes() {
  return (
    <section
      aria-labelledby="faq"
      className="mt-7 border-t border-border/60 pt-7"
    >
      <h2
        id="faq"
        className="text-[13px] font-semibold tracking-tight text-muted-foreground"
      >
        Perguntas frequentes
      </h2>
      <div className="mt-2 divide-y divide-border/60">
        {FAQ.map(({ question, answer }) => (
          <details key={question} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-sm font-medium tracking-tight outline-ring/50 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="pb-3 pr-7 text-[13px] leading-relaxed text-muted-foreground">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
