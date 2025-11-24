-- Ensure circle membership uniqueness per device
CREATE UNIQUE INDEX "CircleMembership_circleId_deviceId_key" ON "CircleMembership"("circleId", "deviceId");
