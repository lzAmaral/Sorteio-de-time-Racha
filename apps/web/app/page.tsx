import { Shirt } from "lucide-react";
import { SorteioFlow } from "@/components/sorteio-flow";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4">
      <header className="flex items-center gap-2.5 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shirt className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight">
            Sorteio do Racha
          </p>
          <p className="text-xs text-muted-foreground">
            Times equilibrados em segundos
          </p>
        </div>
      </header>

      <main className="flex-1 pb-10">
        <SorteioFlow />
      </main>

      <footer className="pb-6 text-center text-xs text-muted-foreground">
        Grátis, sem cadastro. Suas notas ficam só no seu navegador.
      </footer>
    </div>
  );
}
