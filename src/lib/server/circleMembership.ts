import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const DEFAULT_STATUS = 'active';

export const findActiveCircleMembership = (
  circleId: string,
  deviceId: string,
  client: PrismaClient = prisma,
) =>
  client.circleMembership.findFirst({
    where: { circleId, deviceId, status: DEFAULT_STATUS },
  });

export const isDeviceCircleMember = async (
  circleId: string,
  deviceId: string,
  client: PrismaClient = prisma,
) => Boolean(await findActiveCircleMembership(circleId, deviceId, client));
