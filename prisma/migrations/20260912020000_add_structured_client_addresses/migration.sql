ALTER TABLE "client"
  ADD COLUMN "street" VARCHAR(200),
  ADD COLUMN "streetNumber" VARCHAR(20),
  ADD COLUMN "floor" VARCHAR(20),
  ADD COLUMN "apartment" VARCHAR(20),
  ADD COLUMN "city" VARCHAR(100),
  ADD COLUMN "province" VARCHAR(100),
  ADD COLUMN "postalCode" VARCHAR(20),
  ADD COLUMN "addressNotes" TEXT;

ALTER TABLE "visit"
  ADD COLUMN "visitStreet" VARCHAR(200),
  ADD COLUMN "visitStreetNumber" VARCHAR(20),
  ADD COLUMN "visitFloor" VARCHAR(20),
  ADD COLUMN "visitApartment" VARCHAR(20),
  ADD COLUMN "visitCity" VARCHAR(100),
  ADD COLUMN "visitProvince" VARCHAR(100),
  ADD COLUMN "visitPostalCode" VARCHAR(20),
  ADD COLUMN "visitAddressNotes" TEXT;
