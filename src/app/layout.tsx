import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import { FlyoutNavbar } from "@/components/header/FlyoutNavbar";
import { PageAtmosphere } from "@/components/effects/PageAtmosphere";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: "Àvilla | Calçados Femininos",
  description: "Catálogo Àvilla — elegância e conforto em cada passo.",
};

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('avilla-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          href="/fonts/itc-bauhaus/BauhausStd-Heavy.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="min-h-full antialiased"
        style={
          {
            "--font-display": "var(--font-cormorant)",
            "--font-body": "var(--font-dm)",
          } as React.CSSProperties
        }
      >
        <div className="app-shell">
          <Providers>
            <FlyoutNavbar />
            <main className="relative flex-1">
              <PageAtmosphere />
              <div className="relative z-[1]">{children}</div>
            </main>
            <footer className="mt-20 border-t border-[var(--line)] py-10 text-center text-sm text-[var(--muted)]">
              © {new Date().getFullYear()} Àvilla — Calçados femininos
            </footer>
          </Providers>
        </div>
      </body>
    </html>
  );
}
