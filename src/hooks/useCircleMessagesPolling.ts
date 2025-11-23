'use client';

type UseCircleMessagesPollingResult = {
  notMember: boolean;
};

/**
 * ВРЕМЕННЫЙ HOT-FIX:
 * Полностью отключаем поллинг, чтобы остановить флуд запросов
 * и мерцание UI. Потом можно будет вернуть аккуратный long-poll.
 */
export function useCircleMessagesPolling(
  _circleId: string | null,
): UseCircleMessagesPollingResult {
  return { notMember: false };
}
