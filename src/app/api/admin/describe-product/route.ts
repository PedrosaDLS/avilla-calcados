import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { normalizeMarkdown } from "@/lib/markdown";

const bodySchema = z.object({
  imageUrl: z.string().min(1),
});

const PROMPT = `Descreva este calçado feminino para catálogo Àvilla em português do Brasil.
Responda com UM único parágrafo curto (máximo 2 frases, até 35 palavras).
Mencione só o que aparece na foto: tipo, salto, material e estilo.
Tom elegante. Sem emojis, sem preço, sem listas, sem negrito, sem inventar detalhes.
Apenas o texto final, sem blocos de código.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  const { imageUrl } = bodySchema.parse(await req.json());
  const content: Array<{ type: string; text?: string; image_url?: string }> = [
    { type: "text", text: PROMPT },
    { type: "image_url", image_url: imageUrl },
  ];

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
      return NextResponse.json(
        { error: data.error?.message || "Falha ao contactar Mistral." },
        { status: 502 }
      );
    }

    const description = data.choices?.[0]?.message?.content?.trim();
    if (!description) {
      return NextResponse.json({ error: "A IA não retornou descrição." }, { status: 502 });
    }

    return NextResponse.json({ description: normalizeMarkdown(description) });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar descrição." }, { status: 502 });
  }
}
