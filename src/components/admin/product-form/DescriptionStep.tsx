"use client";

import { useState } from "react";
import { inputClass } from "./Field";
import { parseApiResponse } from "./api";
import type { ProductFormState } from "./types";

type Props = {
  state: ProductFormState;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
};

export function DescriptionStep({ state, onChange }: Props) {
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const canGenerate = state.images.length > 0 && !generating;

  async function generateDescription() {
    if (!state.images.length) return;
    setGenerating(true);
    setAiError("");
    try {
      const res = await fetch("/api/admin/describe-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: state.images[0]!.url,
          name: state.name.trim() || undefined,
        }),
      });
      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(String(data.error || "Não foi possível gerar a descrição"));
      }
      if (typeof data.description !== "string" || !data.description.trim()) {
        throw new Error("Resposta da IA inválida.");
      }
      onChange("description", data.description.trim());
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erro ao gerar descrição");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label htmlFor="product-description" className="block text-sm font-medium text-[var(--ink)]">
            Descrição
            <span className="ml-1 font-normal text-[var(--muted)]">(opcional)</span>
          </label>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Suporta Markdown. Detalhes sobre o modelo, salto ou ocasião de uso.
          </p>
        </div>
        <button
          type="button"
          onClick={generateDescription}
          disabled={!canGenerate}
          title={
            state.images.length === 0
              ? "Adicione fotos antes de gerar"
              : "Gerar descrição com IA a partir da primeira foto"
          }
          className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4 text-[var(--accent)]"
            aria-hidden
          >
            <path
              d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 19l1 3 1-3 3-1-3 1-1-3-3 1zM19 5l.5 1.5L21 7l-1.5.5L19 9l-.5-1.5L17 7l1.5-.5L19 5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {generating ? "Analisando foto..." : "Gerar com IA"}
        </button>
      </div>

      <textarea
        id="product-description"
        value={state.description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={4}
        className={inputClass}
        placeholder="Descreva o modelo... (Markdown: **negrito**, - listas)"
      />

      {state.images.length === 0 && (
        <p className="text-xs text-[var(--muted)]">Adicione fotos antes de usar a IA.</p>
      )}
      {aiError && (
        <p className="text-sm text-red-700" role="alert">
          {aiError}
        </p>
      )}
    </div>
  );
}
