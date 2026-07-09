"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";

export default function RegistroPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Erro ao registrar");
      return;
    }
    const login = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    setBusy(false);
    if (login?.error) {
      router.push("/login");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Criar conta</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          name="name"
          required
          minLength={2}
          placeholder="Nome"
          className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
        />
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
          placeholder="Senha (mín. 6)"
          className="w-full border border-[var(--line)] bg-transparent px-4 py-3"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <RoundedSlideButton type="submit" disabled={busy} className="w-full">
          {busy ? "Criando..." : "Registrar"}
        </RoundedSlideButton>
      </form>
      <p className="mt-6 text-sm text-[var(--muted)]">
        Já tem conta?{" "}
        <Link href="/login" className="underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
