"use client";

import { SessionProvider } from "next-auth/react";
import { SerwistProvider } from "@serwist/turbopack/react";
import { MotionProvider } from "@/components/MotionProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js">
      <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
        <MotionProvider>{children}</MotionProvider>
      </SessionProvider>
    </SerwistProvider>
  );
}
