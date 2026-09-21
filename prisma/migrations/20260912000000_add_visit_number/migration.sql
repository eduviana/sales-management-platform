-- Add a human-readable sequential identifier to visits.
ALTER TABLE "visit" ADD COLUMN "visitNumber" INTEGER;

WITH numbered_visits AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS rn
  FROM "visit"
)
UPDATE "visit" SET "visitNumber" = numbered_visits.rn
FROM numbered_visits
WHERE "visit".id = numbered_visits.id;

CREATE SEQUENCE visit_visitnumber_seq START WITH 1 INCREMENT BY 1 NO MAXVALUE CACHE 1;

SELECT setval(
  'visit_visitnumber_seq',
  COALESCE((SELECT MAX("visitNumber") FROM "visit"), 0) + 1,
  false
);

ALTER TABLE "visit"
  ALTER COLUMN "visitNumber" SET DEFAULT nextval('visit_visitnumber_seq'),
  ALTER COLUMN "visitNumber" SET NOT NULL;

ALTER SEQUENCE visit_visitnumber_seq OWNED BY "visit"."visitNumber";
ALTER TABLE "visit" ADD CONSTRAINT "visit_visitNumber_key" UNIQUE ("visitNumber");
