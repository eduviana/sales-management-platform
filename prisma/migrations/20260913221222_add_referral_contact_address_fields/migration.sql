-- AlterTable
ALTER TABLE "referral_contact" ADD COLUMN     "addressNotes" TEXT,
ADD COLUMN     "apartment" VARCHAR(20),
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "floor" VARCHAR(20),
ADD COLUMN     "postalCode" VARCHAR(20),
ADD COLUMN     "province" VARCHAR(100),
ADD COLUMN     "street" VARCHAR(200),
ADD COLUMN     "streetNumber" VARCHAR(20);
