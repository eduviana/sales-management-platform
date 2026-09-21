-- Add an operational client number and optional document number.
ALTER TABLE "client" ADD COLUMN "clientNumber" INTEGER;
ALTER TABLE "client" ADD COLUMN "documentNumber" VARCHAR(50);

WITH numbered_clients AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS rn
  FROM "client"
)
UPDATE "client" SET "clientNumber" = numbered_clients.rn
FROM numbered_clients
WHERE "client".id = numbered_clients.id;

CREATE SEQUENCE client_clientnumber_seq START WITH 1 INCREMENT BY 1 NO MAXVALUE CACHE 1;

SELECT setval(
  'client_clientnumber_seq',
  COALESCE((SELECT MAX("clientNumber") FROM "client"), 0) + 1,
  false
);

ALTER TABLE "client"
  ALTER COLUMN "clientNumber" SET DEFAULT nextval('client_clientnumber_seq'),
  ALTER COLUMN "clientNumber" SET NOT NULL,
  ALTER COLUMN "address" SET NOT NULL;

ALTER SEQUENCE client_clientnumber_seq OWNED BY "client"."clientNumber";
ALTER TABLE "client" ADD CONSTRAINT "client_clientNumber_key" UNIQUE ("clientNumber");
CREATE INDEX "client_documentNumber_idx" ON "client"("documentNumber");
