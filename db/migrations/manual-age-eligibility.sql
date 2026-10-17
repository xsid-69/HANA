-- Adult and age-compatibility data migration.
-- Existing companion ages are normalized into the allowed 18-25 range.
-- Existing clients remain nullable until they verify their age in onboarding/profile.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "age" integer;

UPDATE "companions"
SET "age" = LEAST(25, GREATEST(18, "age"));

UPDATE "users" AS u
SET "age" = c."age"
FROM "companions" AS c
WHERE c."userId" = u."id";

UPDATE "users"
SET "age" = NULL
WHERE "age" IS NOT NULL AND ("age" < 18 OR "age" > 100);

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_age_adult_check";
ALTER TABLE "users"
ADD CONSTRAINT "users_age_adult_check"
CHECK ("age" IS NULL OR ("age" >= 18 AND "age" <= 100));

ALTER TABLE "companions" DROP CONSTRAINT IF EXISTS "companions_age_range_check";
ALTER TABLE "companions"
ADD CONSTRAINT "companions_age_range_check"
CHECK ("age" >= 18 AND "age" <= 25);
