import type { CircleMessage } from '@/types';

export const mergeMessages = (
  existing: CircleMessage[],
  incoming: CircleMessage[],
): CircleMessage[] => {
  if (incoming.length === 0) {
    return existing;
  }

  const map = new Map(existing.map((message) => [message.id, message] as const));
  incoming.forEach((message) => {
    map.set(message.id, message);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};
