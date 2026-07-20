import type { Metadata } from "next";
import { Newsreader, Public_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth/session";

/** Display editorial: eixo óptico + pesos 400–600 (handoff §Tipografia). */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

/** Corpo: sans humanista, pesos 400/500/600/700. */
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillCraft",
  description: "Adaptação inteligente de currículos — SkillCraft",
};

/**
 * As variáveis das fontes ficam no <html>, não no <body>: os tokens
 * --font-sans/--font-display são declarados em :root e só resolvem se as
 * variáveis do next/font existirem no mesmo elemento.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${publicSans.variable}`}>
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
