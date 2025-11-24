// src/lib/server/circleMembership.ts
import type { CircleMembership, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const DEFAULT_STATUS = 'active';

const activeMembershipWhere = { status: DEFAULT_STATUS, leftAt: null } as const;

const findActiveMembershipsForDevice = (
  deviceId: string,
  client: PrismaClient,
) =>
  client.circleMembership.findMany({
    where: { deviceId, ...activeMembershipWhere },
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

export const markMembershipLeft = (
  membershipId: string,
  client: PrismaClient = prisma,
) =>
  client.circleMembership.update({
    where: { id: membershipId },
    data: { status: 'left', leftAt: new Date() },
  });

export const countActiveMembers = async (
  circleId: string,
  client: PrismaClient = prisma,
) => {
  // считаем уникальные девайсы, а не тупо количество строк
  const rows = await client.circleMembership.groupBy({
    by: ['deviceId'],
    where: { circleId, ...activeMembershipWhere },
    _count: { deviceId: true },
  });

  return rows.length;
};

export const findActiveCircleMembership = (
  circleId: string,
  deviceId: string,
  client: PrismaClient = prisma,
) =>
  client.circleMembership.findFirst({
    where: {
      circleId,
      deviceId,
      ...activeMembershipWhere,
      circle: { status: 'active' },
    },
  });

export const isDeviceCircleMember = async (
  circleId: string,
  deviceId: string,
  client: PrismaClient = prisma,
) => Boolean(await findActiveCircleMembership(circleId, deviceId, client));
