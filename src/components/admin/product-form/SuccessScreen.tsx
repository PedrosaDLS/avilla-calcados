import Link from "next/link";
import { RoundedSlideButton } from "@/components/ui/RoundedSlideButton";

type Props = {
  slug: string;
  isEdit: boolean;
  onCreateAnother: () => void;
};

export function SuccessScreen({ slug, isEdit, onCreateAnother }: Props) {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sand)] text-2xl">
        ✓
      </div>
      <div>
        <h2 className="text-xl font-medium">
          {isEdit ? "Modelo atualizado com sucesso!" : "Modelo publicado com sucesso!"}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          O catálogo já pode exibir este modelo na loja.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <RoundedSlideButton href={`/modelo/${slug}`} className="w-full">
          Ver na loja
        </RoundedSlideButton>
        {!isEdit && (
          <button
            type="button"
            onClick={onCreateAnother}
            className="w-full rounded-full border border-[var(--line)] px-5 py-3 text-sm transition hover:border-[var(--accent)]"
          >
            Cadastrar outro
          </button>
        )}
        <Link
          href="/admin/modelos"
          className="text-sm text-[var(--muted)] underline hover:text-[var(--ink)]"
        >
          Voltar à lista
        </Link>
      </div>
    </div>
  );
}
