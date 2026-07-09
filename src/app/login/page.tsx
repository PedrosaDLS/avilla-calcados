"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      setError("Email ou senha inválidos");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Entrar</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Senha"
          className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <RoundedSlideButton type="submit" disabled={busy} className="w-full">
          {busy ? "Entrando..." : "Entrar"}
        </RoundedSlideButton>
      </form>
      <p className="mt-6 text-sm text-[var(--muted)]">
        Não tem conta?{" "}
        <Link href="/registro" className="underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
