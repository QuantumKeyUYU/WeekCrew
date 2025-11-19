import type { Circle, Message } from '@prisma/client';
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
  };
};

export const toCircleMessage = (message: Message): CircleMessage => ({
  id: message.id,
  circleId: message.circleId,
  deviceId: message.deviceId,
  content: message.content,
  isSystem: message.isSystem,
  createdAt: message.createdAt.toISOString(),
});
