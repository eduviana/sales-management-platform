-- CreateEnum
CREATE TYPE "employee_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'LOCKED');

-- CreateEnum
CREATE TYPE "sale_status" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "commission_type" AS ENUM ('EARNED', 'REVERSAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "audit_result" AS ENUM ('SUCCESS', 'FAILURE', 'DENIED');

-- CreateEnum
CREATE TYPE "content_type" AS ENUM ('PDF', 'VIDEO', 'DOCUMENT', 'LINK');

-- CreateEnum
CREATE TYPE "content_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "level" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "rank" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "joinedAt" DATE NOT NULL,
    "currentLevelId" INTEGER,
    "supervisorId" UUID,
    "status" "employee_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_level_history" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "levelId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_level_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_supervisor_history" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "supervisorId" UUID,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_supervisor_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "status" "account_status" NOT NULL DEFAULT 'ACTIVE',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_token" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "categoryId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "saleDate" DATE NOT NULL,
    "status" "sale_status" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_item" (
    "id" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_rule" (
    "id" UUID NOT NULL,
    "levelId" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_entry" (
    "id" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "ruleId" UUID NOT NULL,
    "parentId" UUID,
    "type" "commission_type" NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "saleDate" DATE NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "resourceId" UUID,
    "result" "audit_result" NOT NULL,
    "correlationId" UUID,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_course" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_module" (
    "id" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_material" (
    "id" UUID NOT NULL,
    "moduleId" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "type" "content_type" NOT NULL,
    "url" VARCHAR(500),
    "levelId" INTEGER,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "level_code_key" ON "level"("code");

-- CreateIndex
CREATE UNIQUE INDEX "level_rank_key" ON "level"("rank");

-- CreateIndex
CREATE INDEX "employee_currentLevelId_idx" ON "employee"("currentLevelId");

-- CreateIndex
CREATE INDEX "employee_supervisorId_idx" ON "employee"("supervisorId");

-- CreateIndex
CREATE INDEX "employee_status_idx" ON "employee"("status");

-- CreateIndex
CREATE INDEX "employee_level_history_employeeId_idx" ON "employee_level_history"("employeeId");

-- CreateIndex
CREATE INDEX "employee_level_history_levelId_idx" ON "employee_level_history"("levelId");

-- CreateIndex
CREATE INDEX "employee_level_history_startedAt_idx" ON "employee_level_history"("startedAt");

-- CreateIndex
CREATE INDEX "employee_supervisor_history_employeeId_idx" ON "employee_supervisor_history"("employeeId");

-- CreateIndex
CREATE INDEX "employee_supervisor_history_supervisorId_idx" ON "employee_supervisor_history"("supervisorId");

-- CreateIndex
CREATE INDEX "employee_supervisor_history_startedAt_idx" ON "employee_supervisor_history"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_employeeId_key" ON "user_account"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_email_key" ON "user_account"("email");

-- CreateIndex
CREATE INDEX "password_reset_token_userId_idx" ON "password_reset_token"("userId");

-- CreateIndex
CREATE INDEX "password_reset_token_tokenHash_idx" ON "password_reset_token"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "product_code_key" ON "product"("code");

-- CreateIndex
CREATE INDEX "product_categoryId_idx" ON "product"("categoryId");

-- CreateIndex
CREATE INDEX "product_isActive_idx" ON "product"("isActive");

-- CreateIndex
CREATE INDEX "sale_employeeId_idx" ON "sale"("employeeId");

-- CreateIndex
CREATE INDEX "sale_status_idx" ON "sale"("status");

-- CreateIndex
CREATE INDEX "sale_saleDate_idx" ON "sale"("saleDate");

-- CreateIndex
CREATE INDEX "sale_item_saleId_idx" ON "sale_item"("saleId");

-- CreateIndex
CREATE INDEX "sale_item_productId_idx" ON "sale_item"("productId");

-- CreateIndex
CREATE INDEX "commission_rule_levelId_idx" ON "commission_rule"("levelId");

-- CreateIndex
CREATE INDEX "commission_rule_effectiveFrom_effectiveTo_idx" ON "commission_rule"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "commission_rule_levelId_effectiveFrom_key" ON "commission_rule"("levelId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "commission_entry_saleId_idx" ON "commission_entry"("saleId");

-- CreateIndex
CREATE INDEX "commission_entry_employeeId_idx" ON "commission_entry"("employeeId");

-- CreateIndex
CREATE INDEX "commission_entry_ruleId_idx" ON "commission_entry"("ruleId");

-- CreateIndex
CREATE INDEX "commission_entry_parentId_idx" ON "commission_entry"("parentId");

-- CreateIndex
CREATE INDEX "commission_entry_type_idx" ON "commission_entry"("type");

-- CreateIndex
CREATE INDEX "commission_entry_calculatedAt_idx" ON "commission_entry"("calculatedAt");

-- CreateIndex
CREATE INDEX "audit_event_actorId_idx" ON "audit_event"("actorId");

-- CreateIndex
CREATE INDEX "audit_event_resource_idx" ON "audit_event"("resource");

-- CreateIndex
CREATE INDEX "audit_event_correlationId_idx" ON "audit_event"("correlationId");

-- CreateIndex
CREATE INDEX "audit_event_createdAt_idx" ON "audit_event"("createdAt");

-- CreateIndex
CREATE INDEX "training_course_categoryId_idx" ON "training_course"("categoryId");

-- CreateIndex
CREATE INDEX "training_course_status_idx" ON "training_course"("status");

-- CreateIndex
CREATE INDEX "training_module_courseId_idx" ON "training_module"("courseId");

-- CreateIndex
CREATE INDEX "training_material_moduleId_idx" ON "training_material"("moduleId");

-- CreateIndex
CREATE INDEX "training_material_levelId_idx" ON "training_material"("levelId");

-- CreateIndex
CREATE INDEX "training_material_status_idx" ON "training_material"("status");

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_level_history" ADD CONSTRAINT "employee_level_history_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_level_history" ADD CONSTRAINT "employee_level_history_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_supervisor_history" ADD CONSTRAINT "employee_supervisor_history_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_supervisor_history" ADD CONSTRAINT "employee_supervisor_history_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale" ADD CONSTRAINT "sale_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_rule" ADD CONSTRAINT "commission_rule_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_entry" ADD CONSTRAINT "commission_entry_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_entry" ADD CONSTRAINT "commission_entry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_entry" ADD CONSTRAINT "commission_entry_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "commission_rule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_entry" ADD CONSTRAINT "commission_entry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "commission_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_course" ADD CONSTRAINT "training_course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "training_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_module" ADD CONSTRAINT "training_module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "training_course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_material" ADD CONSTRAINT "training_material_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_material" ADD CONSTRAINT "training_material_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE SET NULL ON UPDATE CASCADE;
