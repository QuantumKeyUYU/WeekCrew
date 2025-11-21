-- Remove duplicate circle/device pairs, keeping the most recent membership
DELETE FROM "CircleMembership" cm
USING (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY "circleId", "deviceId"
        ORDER BY "joinedAt" DESC, "id" DESC
      ) AS rn
    FROM "CircleMembership"
  ) ranked
  WHERE ranked.rn > 1
) duplicates
WHERE cm.id = duplicates.id;
