import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  // Resolve as URLs relativas da metadata (OG image, canonical, sitemap).
  // Vem de NEXT_PUBLIC_SITE_URL; o domínio final ainda está pendente (issue #1).
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  // Long-tail, de propósito: não disputamos o termo genérico com o FutBora.
  keywords: [
    "sorteio de times pra racha",
    "sortear time de pelada",
    "dividir times equilibrados",
    "sorteio de times com goleiro",
    "sorteio de times pelo WhatsApp",
    "cores de colete por time",
  ],
  authors: [{ name: SITE_NAME }],
  category: "sports",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // A imagem vem da convenção `app/opengraph-image.tsx` (1200x630).
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: `${SITE_TAGLINE}. Grátis, sem cadastro.`,
  },
  appleWebApp: {
    capable: true,
    title: "Sorteio",
    statusBarStyle: "default",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
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
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
