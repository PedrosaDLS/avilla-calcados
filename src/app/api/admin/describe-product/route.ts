import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { generateProductDescription } from "@/lib/mistral-describe";

const bodySchema = z.object({
  imageUrl: z.string().min(1),
  name: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
});

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

  const { imageUrl, name, category } = bodySchema.parse(await req.json());

  try {
    const description = await generateProductDescription(imageUrl, apiKey, {
      name,
      category,
    });
    return NextResponse.json({ description });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar descrição.";
    const status = message.includes("Mistral") || message.includes("IA") ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
