import type { CircleMembership, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const DEFAULT_STATUS = 'active';

const findActiveMembershipsForDevice = (
  deviceId: string,
  client: PrismaClient,
) =>
  client.circleMembership.findMany({
    where: { deviceId, status: DEFAULT_STATUS },
    include: { circle: true },
    orderBy: { joinedAt: 'desc' },
  });

const markMembershipsAsLeft = (
  memberships: Pick<CircleMembership, 'id'>[],
  client: PrismaClient,
) => {
  if (!memberships.length) {
    return Promise.resolve();
  }
  return client.circleMembership.updateMany({
    where: { id: { in: memberships.map((membership) => membership.id) } },
    data: { status: 'left', leftAt: new Date() },
  });
};

export const findLatestActiveMembershipForDevice = async (
  deviceId: string,
  client: PrismaClient = prisma,
) => {
  const memberships = await findActiveMembershipsForDevice(deviceId, client);

  if (!memberships.length) {
    return null;
  }

  const [latest, ...duplicates] = memberships;
  if (duplicates.length) {
    await markMembershipsAsLeft(duplicates, client);
  }

  return latest;
};

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
