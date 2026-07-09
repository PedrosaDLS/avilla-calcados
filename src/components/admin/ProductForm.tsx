"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { parseApiResponse } from "./product-form/api";
import { BasicInfoStep } from "./product-form/BasicInfoStep";
import { ImagesStep } from "./product-form/ImagesStep";
import { ReviewStep } from "./product-form/ReviewStep";
import { SuccessScreen } from "./product-form/SuccessScreen";
import type { Category, ImageEntry, ProductFormInitial, ProductFormState } from "./product-form/types";
import { DEFAULT_SIZES } from "./product-form/types";
import { VariantsStep } from "./product-form/VariantsStep";
import {
  getAllSizes,
  mapApiError,
  validateAll,
  type StepErrors,
} from "./product-form/validation";

function buildInitialState(
  categories: Category[],
  initial?: ProductFormInitial
): ProductFormState {
  const allSizes = initial?.sizes ?? [];
  const sizes = allSizes.filter((s) => DEFAULT_SIZES.includes(s));
  const colors = initial?.colors?.length
    ? initial.colors
    : [{ name: "", hex: "#d4b5a0" }];

  return {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price != null ? String(initial.price) : "",
    promoPrice: initial?.promoPrice != null ? String(initial.promoPrice) : "",
    isLaunch: initial?.isLaunch ?? false,
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    colors,
    sizes,
    images: initial?.images ?? [],
  };
}

function hasChanges(state: ProductFormState, baseline: ProductFormState): boolean {
  return JSON.stringify(state) !== JSON.stringify(baseline);
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const baseline = useMemo(
    () => buildInitialState(categories, initial),
    [categories, initial]
  );
  const [state, setState] = useState<ProductFormState>(() => baseline);
  const [errors, setErrors] = useState<StepErrors>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const onChange = useCallback(
    <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    []
  );

  function handleCancel() {
    if (hasChanges(state, baseline)) {
      if (!confirm("Descartar alterações e voltar à lista?")) return;
    }
    router.push("/admin/modelos");
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setSaveError("");
    try {
      const uploaded: ImageEntry[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await parseApiResponse(res);
        if (!res.ok) {
          throw new Error(String(data.error || "Falha no upload"));
        }
        if (typeof data.url !== "string") {
          throw new Error("Resposta de upload inválida.");
        }
        uploaded.push({ url: data.url, colorName: null });
      }
      setState((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    const allErrors = validateAll(state);
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      setSaveError("Corrija os campos destacados antes de publicar.");
      return;
    }

    setBusy(true);
    setSaveError("");

    const colors = state.colors
      .map((c) => ({ name: c.name.trim(), hex: c.hex || null }))
      .filter((c) => c.name);

    const payload = {
      name: state.name.trim(),
      description: state.description.trim(),
      price: Number(state.price),
      promoPrice: state.promoPrice.trim() ? Number(state.promoPrice) : null,
      isLaunch: state.isLaunch,
      categoryId: state.categoryId,
      colors,
      sizes: getAllSizes(state),
      images: state.images.map((img, i) => ({
        url: img.url,
        sortOrder: i,
        colorName: img.colorName ?? null,
      })),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/products/${initial!.id}` : "/api/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(String(data.error || "Erro ao salvar"));
      if (typeof data.slug !== "string") {
        throw new Error("Resposta inválida ao salvar.");
      }
      setSavedSlug(data.slug);
      router.refresh();
    } catch (err) {
      setSaveError(mapApiError(err instanceof Error ? err.message : "Erro"));
    } finally {
      setBusy(false);
    }
  }

  function resetForAnother() {
    setState(buildInitialState(categories));
    setErrors({});
    setSaveError("");
    setSavedSlug(null);
  }

  if (savedSlug) {
    return (
      <SuccessScreen
        slug={savedSlug}
        isEdit={isEdit}
        onCreateAnother={resetForAnother}
      />
    );
  }

  return (
    <div className="pb-8">
      <div className="space-y-10">
        <section>
          <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Informações
          </h3>
          <BasicInfoStep
            state={state}
            categories={categories}
            errors={errors}
            onChange={onChange}
          />
        </section>

        <section>
          <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Cores e numerações
          </h3>
          <VariantsStep state={state} errors={errors} onChange={onChange} />
        </section>

        <section>
          <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Fotos
          </h3>
          <ImagesStep
            state={state}
            errors={errors}
            uploading={uploading}
            onImagesChange={(images) => onChange("images", images)}
            onUpload={uploadFiles}
          />
        </section>

        <section id="revisao" className="scroll-mt-6 border-t border-[var(--line)] pt-10">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Revisão
          </h3>
          <ReviewStep state={state} categories={categories} />
        </section>
      </div>

      {saveError && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {saveError}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm"
        >
          Cancelar
        </button>
        <RoundedSlideButton
          type="button"
          disabled={busy}
          onClick={handleSubmit}
          className="w-full sm:w-auto"
        >
          {busy ? "Publicando..." : isEdit ? "Atualizar modelo" : "Publicar modelo"}
        </RoundedSlideButton>
      </div>
    </div>
  );
}
