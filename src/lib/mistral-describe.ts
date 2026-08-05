import { normalizeMarkdown } from "@/lib/markdown";

const SYSTEM_PROMPT = `Você escreve descrições de catálogo premium para calçados femininos Àvilla, em português do Brasil.

Regras obrigatórias:
- Tom sofisticado e humano, sem jargão de IA, sem clichês de marketing.
- Concordância verbal e nominal com o NOME DO MODELO informado (singular vs plural). O nome manda, não a quantidade de pares na foto.
- Se a foto mostrar vários pares, descreva O MODELO (conforme o nome), nunca a quantidade de peças.
- Um único parágrafo, no máximo 2 frases, cerca de 40 palavras.
- Mencione só o que a foto mostra: tipo, salto e detalhes visíveis.
- Não mencione material, preço, marca ou estoque.
- Sem markdown, listas, emojis, aspas decorativas ou inventar detalhes.
- Proibido abrir com: "Esses são…", "Estas são…", "Esta é um…", "São sapatos…", "Sapatos femininos do tipo…", "combinando elegância e sofisticação".
- Responda apenas com o texto final da descrição.`;

export type DescribeProductOptions = {
  name?: string;
  category?: string;
};

export function resolvePublicImageUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;

  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    "https://avilla-calcados.vercel.app",
  ];

  const base = (
    candidates.find((value) => {
      const trimmed = value?.trim().replace(/^["']|["']$/g, "");
      return trimmed && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(trimmed);
    }) || "https://avilla-calcados.vercel.app"
  )
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/$/, "");

  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

function buildUserText(options?: DescribeProductOptions): string {
  const parts: string[] = [
    "Descreva este calçado para o catálogo Àvilla com base na foto.",
  ];

  if (options?.name?.trim()) {
    parts.push(
      `Nome do modelo (use para concordância singular/plural): «${options.name.trim()}».`
    );
  }

  if (options?.category?.trim()) {
    parts.push(`Categoria: ${options.category.trim()}.`);
  }

  parts.push(
    "Lembrete: a concordância segue o nome do modelo, mesmo se a foto mostrar vários pares."
  );

  return parts.join("\n");
}

export async function generateProductDescription(
  imageUrl: string,
  apiKey: string,
  options?: DescribeProductOptions
): Promise<string> {
  const publicImageUrl = resolvePublicImageUrl(imageUrl);
  const userContent: Array<{ type: string; text?: string; image_url?: string }> = [
    { type: "text", text: buildUserText(options) },
    { type: "image_url", image_url: publicImageUrl },
  ];

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "pixtral-12b-2409",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
          max_tokens: 160,
          temperature: 0.35,
        }),
      });

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };

      if (!res.ok) {
        const message = data.error?.message || "Falha ao contactar Mistral.";
        if (res.status === 429 && attempt < 4) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
          continue;
        }
        throw new Error(message);
      }

      const description = data.choices?.[0]?.message?.content?.trim();
      if (!description) {
        throw new Error("A IA não retornou descrição.");
      }

      return normalizeMarkdown(description);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Falha ao contactar Mistral.");
}
