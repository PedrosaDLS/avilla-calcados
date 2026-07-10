import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const bodySchema = z.object({
  imageUrls: z.array(z.string().min(1)).min(1).max(8),
});

const PROMPT = `Você descreve calçados femininos para um catálogo de luxo brasileiro (Àvilla).
Analise as imagens e escreva uma descrição curta em português do Brasil: 2 a 4 frases simples.
Mencione detalhes visíveis do modelo (tipo de salto, material aparente, fechos, acabamento, estilo e ocasião de uso).
Tom elegante e natural. Sem listas, sem emojis, sem preço, sem inventar o que não aparece na foto.`;

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

  const { imageUrls } = bodySchema.parse(await req.json());
  const content: Array<{ type: string; text?: string; image_url?: string }> = [
    { type: "text", text: PROMPT },
    ...imageUrls.slice(0, 4).map((url) => ({
      type: "image_url",
      image_url: url,
    })),
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
        max_tokens: 300,
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

    return NextResponse.json({ description });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar descrição." }, { status: 502 });
  }
}
