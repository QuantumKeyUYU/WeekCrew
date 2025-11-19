import type { PrismaClient } from '@prisma/client';
import { MAX_MESSAGES_PER_DAY } from '@/constants/limits';
import type { DailyQuotaSnapshot } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;

const getUtcDayBounds = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + DAY_MS);
  return { start, end };
};

interface CheckDailyMessageLimitParams {
  circleId: string;
  deviceId: string;
}

export interface CheckDailyMessageLimitResult {
  allowed: boolean;
  quota: DailyQuotaSnapshot;
}

export const checkDailyMessageLimit = async (
  prisma: PrismaClient,
  { circleId, deviceId }: CheckDailyMessageLimitParams,
): Promise<CheckDailyMessageLimitResult> => {
  const { start, end } = getUtcDayBounds();

  const usedToday = await prisma.message.count({
    where: {
      circleId,
      deviceId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  const remainingToday = Math.max(MAX_MESSAGES_PER_DAY - usedToday, 0);

  return {
    allowed: usedToday < MAX_MESSAGES_PER_DAY,
    quota: {
      dailyLimit: MAX_MESSAGES_PER_DAY,
      usedToday,
      remainingToday,
      resetAtIso: end.toISOString(),
    },
  };
};

export const applyMessageUsageToQuota = (quota: DailyQuotaSnapshot): DailyQuotaSnapshot => ({
  ...quota,
  usedToday: Math.min(quota.usedToday + 1, quota.dailyLimit),
  remainingToday: Math.max(quota.remainingToday - 1, 0),
});
