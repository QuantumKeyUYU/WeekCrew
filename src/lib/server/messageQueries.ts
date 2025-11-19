import type { Prisma } from '@prisma/client';

interface CircleMessageFilters {
  circleId: string;
  since?: Date | null;
}

export const buildCircleMessagesWhere = ({
  circleId,
  since,
}: CircleMessageFilters): Prisma.MessageWhereInput => {
  const where: Prisma.MessageWhereInput = { circleId };

  if (since) {
    where.createdAt = { gt: since };
  }

  return where;
};
