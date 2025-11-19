import type { Circle, Message } from '@prisma/client';
import type { CircleMessage, CircleSummary } from '@/types';

export const toCircleSummary = (circle: Circle, memberCount: number): CircleSummary => ({
  id: circle.id,
  mood: circle.mood,
  interest: circle.interest,
  startsAt: circle.startsAt.toISOString(),
  endsAt: circle.endsAt.toISOString(),
  status: circle.status,
  maxMembers: circle.maxMembers,
  memberCount,
});

export const toCircleMessage = (message: Message): CircleMessage => ({
  id: message.id,
  circleId: message.circleId,
  deviceId: message.deviceId,
  content: message.content,
  isSystem: message.isSystem,
  createdAt: message.createdAt.toISOString(),
});
