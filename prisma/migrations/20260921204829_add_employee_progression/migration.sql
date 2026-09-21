-- CreateEnum
CREATE TYPE "progress_type" AS ENUM ('SENIORITY', 'VISIT', 'SALE', 'TARGET_ACHIEVED');

-- AlterTable
CREATE SEQUENCE employee_employeecode_seq;
ALTER TABLE "employee" ALTER COLUMN "employeeCode" SET DEFAULT nextval('employee_employeecode_seq'),
ALTER COLUMN "deactivatedAt" SET DATA TYPE TIMESTAMP(3);
ALTER SEQUENCE employee_employeecode_seq OWNED BY "employee"."employeeCode";

-- CreateTable
CREATE TABLE "employee_progress" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "type" "progress_type" NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "period" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_progress_employeeId_idx" ON "employee_progress"("employeeId");

-- CreateIndex
CREATE INDEX "employee_progress_type_idx" ON "employee_progress"("type");

-- CreateIndex
CREATE INDEX "employee_progress_period_idx" ON "employee_progress"("period");

-- AddForeignKey
ALTER TABLE "employee_progress" ADD CONSTRAINT "employee_progress_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
