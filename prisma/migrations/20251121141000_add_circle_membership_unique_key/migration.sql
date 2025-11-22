-- Enforce uniqueness of circle/device pairs once duplicates are removed
CREATE UNIQUE INDEX IF NOT EXISTS "CircleMembership_circleId_deviceId_key"
  ON "CircleMembership" ("circleId", "deviceId");
