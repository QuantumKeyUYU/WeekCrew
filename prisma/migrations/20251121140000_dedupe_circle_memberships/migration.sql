-- Remove duplicate circle/device pairs before enforcing uniqueness
DELETE FROM "CircleMembership" cm
USING (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY "circleId", "deviceId" ORDER BY "joinedAt" ASC, "id" ASC) AS rn
    FROM "CircleMembership"
  ) ranked
  WHERE ranked.rn > 1
) duplicates
WHERE cm.id = duplicates.id;

-- Enforce uniqueness of circle/device pairs (idempotent if already applied)
CREATE UNIQUE INDEX IF NOT EXISTS "CircleMembership_circleId_deviceId_key" ON "CircleMembership"("circleId", "deviceId");
