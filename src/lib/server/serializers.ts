import type { Circle, Message, User } from '@prisma/client';
import type { CircleMessage, CircleSummary } from '@/types';
import { getCircleRemainingMs, isCircleActive } from '@/lib/server/circles';

export const toCircleSummary = (circle: Circle, memberCount: number): CircleSummary => {
  const remainingMs = getCircleRemainingMs(circle);
  const active = isCircleActive(circle);

  return {
    id: circle.id,
    mood: circle.mood,
    interest: circle.interest,
    startsAt: circle.startsAt.toISOString(),
    expiresAt: circle.expiresAt.toISOString(),
    status: circle.status,
    maxMembers: circle.maxMembers,
    memberCount,
    remainingMs,
    isExpired: !active,
    icebreaker: circle.icebreaker,
  };
};

const buildAuthor = (user: User | null | undefined) => {
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    nickname: user.nickname,
    avatarKey: user.avatarKey,
  };
};

export const toCircleMessage = (
  message: Message & { user?: User | null },
): CircleMessage => ({
  id: message.id,
  circleId: message.circleId,
  deviceId: message.deviceId,
  author: buildAuthor(message.user),
  content: message.content,
  isSystem: message.isSystem,
  createdAt: message.createdAt.toISOString(),
});
