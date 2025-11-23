'use client';

type UseCircleMessagesPollingResult = {
  notMember: boolean;
};

/**
 * ВРЕМЕННО: поллинг выключен.
 * Никаких дополнительных запросов к /messages, пока не решим
 * как именно хотим делать real-time.
 */
export function useCircleMessagesPolling(
  _circleId: string | null,
): UseCircleMessagesPollingResult {
  return { notMember: false };
}
