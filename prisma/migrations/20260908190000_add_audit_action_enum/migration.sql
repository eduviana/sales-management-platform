-- CreateEnum
CREATE TYPE "audit_action" AS ENUM (
  'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT',
  'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED',
  'EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DEACTIVATED',
  'EMPLOYEE_LEVEL_CHANGED', 'EMPLOYEE_SUPERVISOR_CHANGED',
  'SALE_CREATED', 'SALE_UPDATED', 'SALE_SUBMITTED',
  'SALE_APPROVED', 'SALE_REJECTED', 'SALE_CANCELLED',
  'COMMISSION_RULE_CREATED', 'COMMISSION_GENERATED', 'COMMISSION_REVERSED'
);

-- Rename existing column and change type
ALTER TABLE "audit_event" RENAME COLUMN "details" TO "metadata";
ALTER TABLE "audit_event" RENAME COLUMN "resource" TO "resourceType";
ALTER TABLE "audit_event" ADD COLUMN "actorEmail" VARCHAR(255);

-- Drop old action column and add new enum column
ALTER TABLE "audit_event" DROP COLUMN "action";
ALTER TABLE "audit_event" ADD COLUMN "action" "audit_action" NOT NULL DEFAULT 'LOGIN_SUCCESS';

-- Remove default after adding column
ALTER TABLE "audit_event" ALTER COLUMN "action" DROP DEFAULT;

-- Update indexes
DROP INDEX IF EXISTS "audit_event_resource_idx";
CREATE INDEX "audit_event_resourceType_resourceId_idx" ON "audit_event"("resourceType", "resourceId");
CREATE INDEX "audit_event_action_idx" ON "audit_event"("action");
