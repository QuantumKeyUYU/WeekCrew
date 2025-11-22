-- Add expiresAt column for circle lifetime tracking
ALTER TABLE "Circle" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Backfill existing records using previous endsAt if available
UPDATE "Circle"
SET "expiresAt" = COALESCE("endsAt", "createdAt" + interval '7 days')
WHERE "expiresAt" IS NULL;

ALTER TABLE "Circle"
ALTER COLUMN "expiresAt" SET NOT NULL;
