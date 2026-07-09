"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";
import { BasicInfoStep } from "./product-form/BasicInfoStep";
import { FormStepper } from "./product-form/FormStepper";
import { ImagesStep } from "./product-form/ImagesStep";
import { ReviewStep } from "./product-form/ReviewStep";
import { SuccessScreen } from "./product-form/SuccessScreen";
import type { Category, ImageEntry, ProductFormInitial, ProductFormState } from "./product-form/types";
import { DEFAULT_SIZES } from "./product-form/types";
import { VariantsStep } from "./product-form/VariantsStep";
import {
  getAllSizes,
  mapApiError,
  validateBasicInfo,
  validateImages,
  validateVariants,
  type StepErrors,
} from "./product-form/validation";

function buildInitialState(
  categories: Category[],
  initial?: ProductFormInitial
): ProductFormState {
  const allSizes = initial?.sizes ?? [];
  const sizes = allSizes.filter((s) => DEFAULT_SIZES.includes(s));
  const extraSizes = allSizes.filter((s) => !DEFAULT_SIZES.includes(s)).join(", ");
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
    extraSizes,
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
  const [step, setStep] = useState(1);
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

  function validateStep(current: number): boolean {
    let stepErrors: StepErrors = {};
    if (current === 1) stepErrors = validateBasicInfo(state);
    if (current === 2) stepErrors = validateVariants(state);
    if (current === 3) stepErrors = validateImages(state);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

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
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha no upload");
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
    if (!validateStep(3)) {
      setStep(3);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
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
    setStep(1);
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
    <div className="pb-28 md:pb-8">
      <FormStepper currentStep={step} />

      {step === 1 && (
        <BasicInfoStep
          state={state}
          categories={categories}
          errors={errors}
          onChange={onChange}
        />
      )}
      {step === 2 && (
        <VariantsStep state={state} errors={errors} onChange={onChange} />
      )}
      {step === 3 && (
        <ImagesStep
          state={state}
          errors={errors}
          uploading={uploading}
          onImagesChange={(images) => onChange("images", images)}
          onUpload={uploadFiles}
        />
      )}
      {step === 4 && <ReviewStep state={state} categories={categories} />}

      {saveError && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {saveError}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[var(--line)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm sm:flex-none"
            >
              Cancelar
            </button>
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="flex-1 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm sm:flex-none"
              >
                Voltar
              </button>
            )}
          </div>
          {step < 4 ? (
            <RoundedSlideButton type="button" onClick={goNext} className="w-full sm:w-auto">
              Continuar
            </RoundedSlideButton>
          ) : (
            <RoundedSlideButton
              type="button"
              disabled={busy}
              onClick={handleSubmit}
              className="w-full sm:w-auto"
            >
              {busy ? "Publicando..." : isEdit ? "Atualizar modelo" : "Publicar modelo"}
            </RoundedSlideButton>
          )}
        </div>
      </div>
    </div>
  );
}
