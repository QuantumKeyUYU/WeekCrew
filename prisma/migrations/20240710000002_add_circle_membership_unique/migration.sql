-- Add unique constraint for circle and device membership pairing
CREATE UNIQUE INDEX "CircleMembership_circleId_deviceId_key" ON "CircleMembership"("circleId", "deviceId");
