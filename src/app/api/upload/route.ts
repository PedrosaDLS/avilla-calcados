import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif"];

function canUseLocalDisk() {
  return process.env.VERCEL !== "1";
}

async function uploadToBlob(filename: string, buffer: Buffer, contentType: string) {
  const blob = await put(`products/${filename}`, buffer, {
    access: "public",
    contentType,
  });
  return blob.url;
}

async function uploadToUploadThing(file: File) {
  const utapi = new UTApi();
  const result = await utapi.uploadFiles(file);
  if (result.error) {
    throw new Error(result.error.message || "Falha no UploadThing");
  }
  if (!result.data?.url) {
    throw new Error("UploadThing não retornou URL da imagem.");
  }
  return result.data.url;
}

async function uploadToLocal(filename: string, buffer: Buffer) {
  const uploadRoot =
    process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadRoot, { recursive: true });
  await writeFile(path.join(uploadRoot, filename), buffer);
  return `/uploads/${filename}`;
}

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
    const contentType = file.type || `image/${ext === "jpg" ? "jpeg" : ext}`;

    let url: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      url = await uploadToBlob(filename, buffer, contentType);
    } else if (process.env.UPLOADTHING_TOKEN) {
      url = await uploadToUploadThing(file);
    } else if (canUseLocalDisk()) {
      url = await uploadToLocal(filename, buffer);
    } else {
      return NextResponse.json(
        {
          error:
            "Armazenamento de imagens não configurado em produção. Configure UploadThing ou Vercel Blob.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload]", err);
    const message =
      err instanceof Error ? err.message : "Falha ao enviar imagem. Tente novamente.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
