-- DropIndex
DROP INDEX "client_ownerEmployeeId_idx";

-- AlterTable
ALTER TABLE "client" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "referral_contact" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
CREATE SEQUENCE sale_salenumber_seq;
ALTER TABLE "sale" ADD COLUMN     "cardBrand" VARCHAR(40),
ADD COLUMN     "cardLast4" VARCHAR(4),
ADD COLUMN     "clientDocumentNumber" VARCHAR(50),
ADD COLUMN     "clientDocumentType" VARCHAR(30),
ADD COLUMN     "clientEmail" VARCHAR(255),
ADD COLUMN     "clientPhone" VARCHAR(50),
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryEstimatedDate" DATE,
ADD COLUMN     "deliveryStatus" VARCHAR(30),
ADD COLUMN     "externalInvoiceReference" VARCHAR(150),
ADD COLUMN     "externalPaymentReference" VARCHAR(150),
ADD COLUMN     "invoiceStatus" VARCHAR(30),
ADD COLUMN     "paymentStatus" VARCHAR(30),
ALTER COLUMN "saleNumber" SET DEFAULT nextval('sale_salenumber_seq');
ALTER SEQUENCE sale_salenumber_seq OWNED BY "sale"."saleNumber";

-- AlterTable
ALTER TABLE "visit" ALTER COLUMN "completedDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "client_ownerEmployeeId_idx" ON "client"("ownerEmployeeId");

-- CreateIndex
CREATE INDEX "sale_paymentStatus_idx" ON "sale"("paymentStatus");

-- CreateIndex
CREATE INDEX "sale_deliveryStatus_idx" ON "sale"("deliveryStatus");

-- CreateIndex
CREATE INDEX "sale_invoiceStatus_idx" ON "sale"("invoiceStatus");
