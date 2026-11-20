import { SorteioFlow } from "@/components/sorteio-flow";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-10 pt-8">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black tracking-tight">
          ⚽ Sorteio do Racha
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Cola a lista do grupo, define quantos times e pronto.
        </p>
      </header>
      <SorteioFlow />
      <footer className="mt-auto pt-10 text-center text-xs text-zinc-600">
        Grátis, sem cadastro. Suas notas ficam só no seu navegador.
      </footer>
    </main>
  );
}
