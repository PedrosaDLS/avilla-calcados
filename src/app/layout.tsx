import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import { FlyoutNavbar } from "@/components/header/FlyoutNavbar";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: "Ávilla | Calçados Femininos",
  description: "Catálogo Ávilla — moda, qualidade e conforto.",
  applicationName: "Ávilla",
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "1024x1024" },
      { url: "/icons/pwa-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/pwa-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
      { url: "/apple-icon", type: "image/png", sizes: "1024x1024" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ávilla",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FF0000",
  viewportFit: "cover",
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
        <Script id="avilla-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <div className="app-shell">
          <Providers>
            <FlyoutNavbar />
            <main className="relative flex-1">
              <div className="relative z-[1]">{children}</div>
            </main>
            <footer className="mt-20 border-t border-[var(--line)] py-10 text-center text-sm text-[var(--muted)]">
              <p>© {new Date().getFullYear()} Àvilla — Calçados femininos</p>
              <p className="mt-3">
                Desenvolvido por{" "}
                <a
                  href="https://wa.me/553899212617"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4 transition hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
                >
                  Pedro Henrique Paixão
                </a>
              </p>
            </footer>
          </Providers>
        </div>
      </body>
    </html>
  );
}
