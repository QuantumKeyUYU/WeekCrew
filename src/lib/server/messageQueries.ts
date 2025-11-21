import type { Prisma } from '@prisma/client';

interface CircleMessageFilters {
  circleId: string;
  blockedUserIds?: string[];
  since?: Date | null;
}

export const buildCircleMessagesWhere = ({
  circleId,
  blockedUserIds,
  since,
}: CircleMessageFilters): Prisma.MessageWhereInput => {
  const where: Prisma.MessageWhereInput = { circleId };

  if (blockedUserIds?.length) {
    where.userId = { notIn: blockedUserIds };
  }

  if (since && !Number.isNaN(since.getTime())) {
    where.createdAt = { gt: since };
  }

  return where;
};
