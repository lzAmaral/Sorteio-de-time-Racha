import { Shirt } from "lucide-react";
import { SorteioFlow } from "@/components/sorteio-flow";
import {
  ComoFunciona,
  PerguntasFrequentes,
} from "@/components/landing-sections";
import { structuredData } from "@/lib/site";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4">
      <header className="flex items-center gap-2.5 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shirt className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight">
            VaiTerRacha
          </p>
          <p className="text-xs text-muted-foreground">
            Times equilibrados em segundos
          </p>
        </div>
      </header>

      <main className="flex-1 pb-10">
        <SorteioFlow />
      </main>

      {/* Conteúdo indexável, sempre abaixo da dobra: a ferramenta é a landing. */}
      <ComoFunciona />
      <PerguntasFrequentes />

      <footer className="py-7 text-center text-xs text-muted-foreground">
        Grátis, sem cadastro. Suas notas ficam só no seu navegador.
      </footer>

      {/* Schema.org (WebApplication + FAQPage) — renderizado no build. */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- conteúdo estático nosso, sem input de usuário
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
