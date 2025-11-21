import type { Prisma } from '@prisma/client';

interface CircleMessageFilters {
  circleId: string;
  since?: Date | null;
  blockedUserIds?: string[];
}

export const buildCircleMessagesWhere = ({
  circleId,
  since,
  blockedUserIds,
}: CircleMessageFilters): Prisma.MessageWhereInput => {
  const where: Prisma.MessageWhereInput = { circleId };

  if (since) {
    where.createdAt = { gt: since };
  }

  if (blockedUserIds?.length) {
    where.userId = { notIn: blockedUserIds };
  }

  return where;
};
