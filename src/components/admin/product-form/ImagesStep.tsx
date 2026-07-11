import Image from "next/image";
import { useRef, useState } from "react";
import { Field } from "./Field";
import type { ImageEntry, ProductFormState } from "./types";
import type { StepErrors } from "./validation";

type Props = {
  state: ProductFormState;
  errors: StepErrors;
  uploading: boolean;
  onImagesChange: (images: ImageEntry[]) => void;
  onUpload: (files: FileList | null) => Promise<void>;
};

export function ImagesStep({ state, errors, uploading, onImagesChange, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function moveImage(index: number, direction: -1 | 1) {
    const next = [...state.images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onImagesChange(next);
  }

  function removeImage(index: number) {
    onImagesChange(state.images.filter((_, i) => i !== index));
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      await onUpload(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-5">
      <Field
        id="product-images"
        label="Fotos do modelo"
        hint="JPG, PNG, WEBP ou GIF · até 5MB cada. A primeira foto é a principal."
        error={errors.images}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragOver
              ? "border-[var(--accent)] bg-[var(--sand)]"
              : "border-[var(--line)] hover:border-[var(--accent)]"
          }`}
        >
          <p className="text-sm font-medium text-[var(--ink)]">
            Arraste fotos ou clique para enviar
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            JPG, PNG, WEBP ou GIF · máximo 5MB por arquivo
          </p>
          {uploading && (
            <p className="mt-3 text-sm text-[var(--accent)]">Enviando foto...</p>
          )}
          <input
            ref={inputRef}
            id="product-images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={(e) => onUpload(e.target.files)}
          />
        </div>
      </Field>

      <div className="space-y-4">
        {state.images.map((img, index) => (
          <div
            key={`${img.url}-${index}`}
            className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-elevated)] p-3 sm:flex-row sm:items-center"
          >
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--sand)]">
              <Image src={img.url} alt="" fill className="object-cover" sizes="96px" />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-[var(--ink)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--bg)]">
                  Principal
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveImage(index, -1)}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-xs disabled:opacity-40"
                >
                  Subir
                </button>
                <button
                  type="button"
                  disabled={index === state.images.length - 1}
                  onClick={() => moveImage(index, 1)}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-xs disabled:opacity-40"
                >
                  Descer
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-700"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
