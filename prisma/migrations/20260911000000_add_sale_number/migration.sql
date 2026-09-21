-- AlterTable: Add saleNumber column to sale table
ALTER TABLE "sale" ADD COLUMN "saleNumber" INTEGER;

-- Backfill: Assign sequential numbers to existing sales
WITH numbered_sales AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn
  FROM "sale"
)
UPDATE "sale" SET "saleNumber" = ns.rn
FROM numbered_sales ns
WHERE "sale".id = ns.id;

-- CreateSequence: Create sequence for future sale numbers
CREATE SEQUENCE sale_number_seq START WITH 7 INCREMENT BY 1 NO MAXVALUE CACHE 1;

-- AlterColumn: Make saleNumber NOT NULL
ALTER TABLE "sale" ALTER COLUMN "saleNumber" SET NOT NULL;

-- Add unique constraint
ALTER TABLE "sale" ADD CONSTRAINT "sale_saleNumber_key" UNIQUE ("saleNumber");
