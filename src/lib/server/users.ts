import type { User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { UserProfile } from '@/types';

export const toUserProfile = (user: User): UserProfile => ({
  id: user.id,
  deviceId: user.deviceId,
  nickname: user.nickname,
  avatarKey: user.avatarKey,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export const findUserByDeviceId = (deviceId: string) =>
  prisma.user.findUnique({ where: { deviceId } });

export const getUserWithBlocks = (deviceId: string) =>
  prisma.user.findUnique({
    where: { deviceId },
    include: {
      blocksInitiated: {
        select: { blockedId: true },
      },
    },
  });
