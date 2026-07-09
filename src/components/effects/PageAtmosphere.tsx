"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Aurora from "@/components/effects/Aurora";

/** Light: warm sand / terracotta — visible on cream bg */
const LIGHT = ["#e8d0bc", "#d4a88a", "#b8835a"];
/** Dark: charcoal with warm amber lift */
const DARK = ["#2a211b", "#5c4a3e", "#a87e60"];

export function PageAtmosphere({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    setReady(true);
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => mo.disconnect();
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (!ready) {
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      />
    );
  }

  if (reduced) {
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-0 opacity-50 ${className}`}
        style={{
          background: dark
            ? "radial-gradient(ellipse at 50% 0%, #2a211b 0%, transparent 70%)"
            : "radial-gradient(ellipse at 50% 0%, #ebe4db 0%, transparent 70%)",
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 min-h-full w-full ${className}`}
    >
      <Aurora
        key={dark ? "dark" : "light"}
        colorStops={dark ? DARK : LIGHT}
        amplitude={1.45}
        blend={0.72}
        speed={0.85}
        className="h-full min-h-full w-full"
      />
    </div>
  );
}
