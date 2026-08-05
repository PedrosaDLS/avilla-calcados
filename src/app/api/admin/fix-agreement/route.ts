import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateProductDescription } from "@/lib/mistral-describe";
import {
  auditDescription,
  formatAuditRow,
  type AuditRow,
} from "@/lib/description-audit";
import { revalidateCatalog } from "@/lib/revalidate-catalog";

export const maxDuration = 300;

const bodySchema = z.object({
  mode: z.enum(["audit", "fix"]).default("audit"),
  slug: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  delayMs: z.number().int().min(0).max(5000).optional(),
  dryRun: z.boolean().optional(),
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function authorized(req: Request, session: { user?: { role?: string } } | null) {
  if (session?.user?.role === "ADMIN") return true;
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  return Boolean(secret && token && token === secret);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!authorized(req, session as { user?: { role?: string } } | null)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = bodySchema.parse(await req.json().catch(() => ({})));
  const products = await prisma.product.findMany({
    where: body.slug ? { slug: body.slug } : undefined,
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const flagged: AuditRow[] = [];
  for (const product of products) {
    const findings = auditDescription(product.name, product.description);
    if (findings.length) flagged.push(formatAuditRow(product, findings));
  }

  if (body.mode === "audit") {
    return NextResponse.json({
      totalProducts: products.length,
      flaggedCount: flagged.length,
      flagged: flagged.map(({ id, slug, name, snippet, reasons }) => ({
        id,
        slug,
        name,
        snippet,
        reasons,
      })),
    });
  }

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MISTRAL_API_KEY não configurada." },
      { status: 500 }
    );
  }

  const delayMs = body.delayMs ?? 400;
  const dryRun = body.dryRun ?? false;
  const byId = new Map(products.map((p) => [p.id, p]));
  let toFix = flagged
    .map((row) => byId.get(row.id))
    .filter((p): p is (typeof products)[number] => Boolean(p));

  if (body.limit) {
    toFix = toFix.slice(0, body.limit);
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const errors: { slug: string; message: string }[] = [];
  const regenerated: { slug: string; description: string }[] = [];

  for (let i = 0; i < toFix.length; i++) {
    const product = toFix[i]!;
    const imageUrl = product.images[0]?.url;
    if (!imageUrl) {
      skipped++;
      continue;
    }

    try {
      const description = await generateProductDescription(imageUrl, apiKey, {
        name: product.name,
      });
      if (!dryRun) {
        await prisma.product.update({
          where: { id: product.id },
          data: { description },
        });
      }
      updated++;
      regenerated.push({ slug: product.slug, description });
    } catch (error) {
      failed++;
      errors.push({
        slug: product.slug,
        message: error instanceof Error ? error.message : String(error),
      });
    }

    if (delayMs > 0 && i < toFix.length - 1) {
      await sleep(delayMs);
    }
  }

  if (!dryRun && updated > 0) {
    await revalidateCatalog();
  }

  const stillFlagged: AuditRow[] = [];
  if (regenerated.length) {
    const recheck = dryRun
      ? regenerated.map((row) => {
          const product = toFix.find((p) => p.slug === row.slug)!;
          return {
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: row.description,
          };
        })
      : await prisma.product.findMany({
          where: { slug: { in: regenerated.map((r) => r.slug) } },
          select: { id: true, slug: true, name: true, description: true },
        });

    for (const product of recheck) {
      const findings = auditDescription(product.name, product.description);
      if (findings.length) stillFlagged.push(formatAuditRow(product, findings));
    }
  }

  return NextResponse.json({
    totalProducts: products.length,
    flaggedBefore: flagged.length,
    attempted: toFix.length,
    remainingFlagged: Math.max(0, flagged.length - toFix.length),
    updated,
    skipped,
    failed,
    dryRun,
    errors: errors.slice(0, 20),
    stillFlaggedCount: stillFlagged.length,
    stillFlagged: stillFlagged.slice(0, 20).map(({ slug, name, snippet, reasons }) => ({
      slug,
      name,
      snippet,
      reasons,
    })),
    sample: regenerated.find((r) => r.slug.includes("sapatilha-laco-gorgon"))
      || regenerated[0]
      || null,
  });
}
