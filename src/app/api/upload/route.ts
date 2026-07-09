import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif"];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Máximo 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`products/${filename}`, buffer, {
        access: "public",
        contentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
      });
      return NextResponse.json({ url: blob.url });
    }

    const uploadRoot =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadRoot, { recursive: true });
    await writeFile(path.join(uploadRoot, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("[upload]", err);
    const message =
      err instanceof Error ? err.message : "Falha ao enviar imagem. Tente novamente.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
