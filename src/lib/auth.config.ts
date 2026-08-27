import type { NextAuthConfig } from "next-auth";

export type AppRole = "USER" | "ADMIN";

declare module "next-auth" {
  interface User {
    role: AppRole;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: AppRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    name?: string | null;
    email?: string | null;
  }
}

/**
 * Edge-safe Auth.js config (no Prisma / bcrypt / pg).
 * Used by middleware. Full Credentials authorize lives in auth.ts (Node).
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    // Browser cookie cap ~400d. Visit after updateAge extends the JWT; does not invalidate existing sessions.
    maxAge: 60 * 60 * 24 * 400,
    updateAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
