-- Ensure one active membership per device per circle
CREATE UNIQUE INDEX IF NOT EXISTS "CircleMembership_circleId_deviceId_key" ON "CircleMembership"("circleId", "deviceId");
