import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sorteio do Racha — times equilibrados em segundos",
  description:
    "Cola a lista do grupo, define quantos times e pronto: sorteio equilibrado, cor de colete pra cada time e o resultado pronto pra mandar no zap.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
