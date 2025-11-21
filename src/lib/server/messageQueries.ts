import type { Prisma } from '@prisma/client';

interface CircleMessageFilters {
  circleId: string;
  blockedUserIds?: string[];
}

export const buildCircleMessagesWhere = ({
  circleId,
  blockedUserIds,
}: CircleMessageFilters): Prisma.MessageWhereInput => {
  const where: Prisma.MessageWhereInput = { circleId };

  if (blockedUserIds?.length) {
    where.userId = { notIn: blockedUserIds };
  }

  return where;
};
