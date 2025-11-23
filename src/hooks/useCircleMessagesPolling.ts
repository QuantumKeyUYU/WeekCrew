'use client';

type UseCircleMessagesPollingResult = {
  notMember: boolean;
};

/**
 * Поллинг временно отключён.
 * Никаких дополнительных запросов к /messages.
 */
export function useCircleMessagesPolling(
  _circleId: string | null,
): UseCircleMessagesPollingResult {
  return { notMember: false };
}
