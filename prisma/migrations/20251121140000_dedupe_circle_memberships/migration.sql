-- Remove duplicate circle/device pairs before enforcing uniqueness
WITH duplicates AS (
  SELECT ctid
  FROM (
    SELECT ctid,
           ROW_NUMBER() OVER (PARTITION BY "circleId", "deviceId" ORDER BY "joinedAt" ASC, "id" ASC) AS rn
    FROM "CircleMembership"
  ) ranked
  WHERE ranked.rn > 1
)
DELETE FROM "CircleMembership"
WHERE ctid IN (SELECT ctid FROM duplicates);

-- Enforce uniqueness of circle/device pairs (idempotent if already applied)
CREATE UNIQUE INDEX IF NOT EXISTS "CircleMembership_circleId_deviceId_key" ON "CircleMembership"("circleId", "deviceId");
