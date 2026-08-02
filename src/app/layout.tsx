import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FACTO — Inteligência Artificial para peças jurídicas",
  description:
    "O FACTO redige peças jurídicas com IA: economize horas, jurisprudência atualizada e formatação impecável, prontas para protocolar.",
  applicationName: "FACTO",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FACTO",
    statusBarStyle: "black-translucent",
  },
  other: {
    "theme-color": "#1c1c16",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=20260801e", sizes: "48x48" },
      { url: "/icon-atalho-192.png?v=20260801e", sizes: "192x192", type: "image/png" },
      { url: "/icon-atalho-512.png?v=20260801e", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icon-atalho-180.png?v=20260801e",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
