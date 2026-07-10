-- AlterTable: add colorId (nullable during backfill)
ALTER TABLE "ProductSize" ADD COLUMN "colorId" TEXT;

-- DropIndex
DROP INDEX "ProductSize_productId_size_key";

-- Backfill: duplicate each existing size for every color of the product
INSERT INTO "ProductSize" ("id", "productId", "size", "colorId")
SELECT
  'm_' || ps."id" || '_' || pc."id",
  ps."productId",
  ps."size",
  pc."id"
FROM "ProductSize" ps
INNER JOIN "ProductColor" pc ON pc."productId" = ps."productId"
WHERE ps."colorId" IS NULL;

-- Remove legacy rows without colorId (includes orphans with no colors)
DELETE FROM "ProductSize" WHERE "colorId" IS NULL;

-- Make colorId required
ALTER TABLE "ProductSize" ALTER COLUMN "colorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_colorId_size_key" ON "ProductSize"("colorId", "size");
