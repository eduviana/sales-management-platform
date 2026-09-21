ALTER TABLE "sale"
ADD COLUMN "approvedAt" TIMESTAMP(3);

ALTER TABLE "commission_entry"
ADD COLUMN "baseAmount" DECIMAL(14,2) NOT NULL DEFAULT 0;

ALTER TABLE "commission_entry"
ALTER COLUMN "baseAmount" DROP DEFAULT;

CREATE UNIQUE INDEX "commission_entry_one_earned_per_sale_idx"
ON "commission_entry" ("saleId")
WHERE "type" = 'EARNED';

CREATE UNIQUE INDEX "commission_entry_one_reversal_per_parent_idx"
ON "commission_entry" ("parentId")
WHERE "type" = 'REVERSAL' AND "parentId" IS NOT NULL;
