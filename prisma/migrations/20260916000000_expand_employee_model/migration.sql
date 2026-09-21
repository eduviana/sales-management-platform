-- AlterTable: Expand Employee model
-- Adds: employeeCode, dni, email, phone, dateOfBirth, address fields,
--        deactivatedAt, deactivationReason

-- 1. Add new columns (nullable for existing rows)
ALTER TABLE "employee" ADD COLUMN "employeeCode" INTEGER;
ALTER TABLE "employee" ADD COLUMN "dni" VARCHAR(20);
ALTER TABLE "employee" ADD COLUMN "email" VARCHAR(255);
ALTER TABLE "employee" ADD COLUMN "phone" VARCHAR(50);
ALTER TABLE "employee" ADD COLUMN "dateOfBirth" DATE;
ALTER TABLE "employee" ADD COLUMN "deactivatedAt" TIMESTAMPTZ;
ALTER TABLE "employee" ADD COLUMN "deactivationReason" TEXT;
ALTER TABLE "employee" ADD COLUMN "street" VARCHAR(200);
ALTER TABLE "employee" ADD COLUMN "streetNumber" VARCHAR(20);
ALTER TABLE "employee" ADD COLUMN "floor" VARCHAR(20);
ALTER TABLE "employee" ADD COLUMN "apartment" VARCHAR(20);
ALTER TABLE "employee" ADD COLUMN "city" VARCHAR(100);
ALTER TABLE "employee" ADD COLUMN "province" VARCHAR(100);
ALTER TABLE "employee" ADD COLUMN "postalCode" VARCHAR(20);

-- 2. Populate employeeCode for existing rows (sequential)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn
  FROM "employee"
)
UPDATE "employee" e
SET "employeeCode" = n.rn
FROM numbered n
WHERE e.id = n.id;

-- 3. Add NOT NULL constraint to employeeCode (now populated)
ALTER TABLE "employee" ALTER COLUMN "employeeCode" SET NOT NULL;

-- 4. Add unique constraints
ALTER TABLE "employee" ADD CONSTRAINT "employee_employeeCode_key" UNIQUE ("employeeCode");
-- dni, email are nullable unique — PostgreSQL allows multiple NULLs
ALTER TABLE "employee" ADD CONSTRAINT "employee_dni_key" UNIQUE ("dni");
ALTER TABLE "employee" ADD CONSTRAINT "employee_email_key" UNIQUE ("email");
