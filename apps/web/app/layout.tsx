import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Sorteio do Racha — times equilibrados em segundos",
  description:
    "Cola a lista do grupo, define quantos times e pronto: sorteio equilibrado, cor de colete pra cada time e o resultado pronto pra mandar no zap.",
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body className="min-h-dvh bg-zinc-50 text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
