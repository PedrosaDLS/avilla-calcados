import { normalizeMarkdown } from "@/lib/markdown";

const PRODUCT_DESCRIPTION_PROMPT = `Descreva este calçado feminino para catálogo Àvilla em português do Brasil.
Responda com UM único parágrafo curto (máximo 2 frases, até 35 palavras).
Mencione só o que aparece na foto: tipo, salto e estilo.
Não mencione material, preço ou marca.
Tom elegante. Sem emojis, sem listas, sem negrito, sem inventar detalhes.
Apenas o texto final, sem blocos de código.`;

export function resolvePublicImageUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;

  const base = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://avilla-calcados.vercel.app"
  )
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/$/, "");

  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function generateProductDescription(
  imageUrl: string,
  apiKey: string
): Promise<string> {
  const publicImageUrl = resolvePublicImageUrl(imageUrl);
  const content: Array<{ type: string; text?: string; image_url?: string }> = [
    { type: "text", text: PRODUCT_DESCRIPTION_PROMPT },
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
          messages: [{ role: "user", content }],
          max_tokens: 120,
          temperature: 0.4,
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
