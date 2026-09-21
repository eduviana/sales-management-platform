-- CreateEnum
CREATE TYPE "visit_status" AS ENUM ('ASSIGNED', 'COMPLETED', 'NO_SALE', 'CANCELLED');

-- CreateTable
CREATE TABLE "client" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "address" TEXT,
    "referredBySaleId" UUID,
    "ownerEmployeeId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit" (
    "id" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "assignedById" UUID NOT NULL,
    "scheduledDate" DATE NOT NULL,
    "completedDate" TIMESTAMPTZ(6),
    "status" "visit_status" NOT NULL DEFAULT 'ASSIGNED',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_contact" (
    "id" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "clientName" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_contact_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add new columns to sale
ALTER TABLE "sale" ADD COLUMN "visitId" UUID,
 ADD COLUMN "clientId" UUID,
 ADD COLUMN "paymentMethod" VARCHAR(50),
 ADD COLUMN "installments" INTEGER,
 ADD COLUMN "discount" DECIMAL(14,2),
 ADD COLUMN "discountReason" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "client_ownerEmployeeId_idx" ON "client"("ownerEmployeeId");
CREATE INDEX "client_referredBySaleId_idx" ON "client"("referredBySaleId");
CREATE INDEX "visit_sellerId_idx" ON "visit"("sellerId");
CREATE INDEX "visit_clientId_idx" ON "visit"("clientId");
CREATE INDEX "visit_assignedById_idx" ON "visit"("assignedById");
CREATE INDEX "visit_status_idx" ON "visit"("status");
CREATE INDEX "visit_scheduledDate_idx" ON "visit"("scheduledDate");
CREATE INDEX "referral_contact_saleId_idx" ON "referral_contact"("saleId");
CREATE UNIQUE INDEX "sale_visitId_key" ON "sale"("visitId");
CREATE INDEX "sale_clientId_idx" ON "sale"("clientId");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_referredBySaleId_fkey" FOREIGN KEY ("referredBySaleId") REFERENCES "sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "client" ADD CONSTRAINT "client_ownerEmployeeId_fkey" FOREIGN KEY ("ownerEmployeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "visit" ADD CONSTRAINT "visit_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "visit" ADD CONSTRAINT "visit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "visit" ADD CONSTRAINT "visit_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "referral_contact" ADD CONSTRAINT "referral_contact_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sale" ADD CONSTRAINT "sale_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sale" ADD CONSTRAINT "sale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
