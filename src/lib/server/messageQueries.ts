import type { Prisma } from '@prisma/client';

interface CircleMessageFilters {
  circleId: string;
  since?: Date | null;
  excludeUserIds?: string[];
}

export const buildCircleMessagesWhere = ({
  circleId,
  since,
  excludeUserIds,
}: CircleMessageFilters): Prisma.MessageWhereInput => {
  const where: Prisma.MessageWhereInput = { circleId };

  if (since) {
    where.createdAt = { gt: since };
  }

  if (excludeUserIds?.length) {
    where.userId = { notIn: excludeUserIds };
  }

  return where;
};
