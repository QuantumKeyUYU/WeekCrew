import type { CircleMessage, CircleSummary, DailyQuotaSnapshot } from '@/types';
import { ApiError, fetchJson } from '@/lib/api-client';

export interface JoinCirclePayload {
  mood: string;
  interest: string;
}

export interface JoinCircleResponse {
  ok: true;
  circle: CircleSummary;
  messages: CircleMessage[];
  isNewCircle: boolean;
}

export class AuthError extends ApiError {}
export class DeviceError extends ApiError {}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const joinCircle = async (payload: JoinCirclePayload) => {
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fetchJson<JoinCircleResponse>('/api/circles/join', {
        method: 'POST',
        json: payload,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
          throw new AuthError(error.status, error.message, error.data);
        }
        if ([400, 409, 428].includes(error.status)) {
          throw new DeviceError(error.status, error.message, error.data);
        }
        const shouldRetry = error.status >= 500;
        if (!shouldRetry || attempt === maxAttempts) {
          throw error;
        }
      } else if (attempt === maxAttempts) {
        throw error;
      }

      const delay = 300 * attempt;
      await wait(delay);
    }
  }

  throw new Error('Unable to join circle');
};

export interface CurrentCircleResponse {
  circle: CircleSummary | null;
}

export const getCurrentCircle = () =>
  fetchJson<CurrentCircleResponse>('/api/circles/current');

export interface CircleMessagesResponse {
  ok?: boolean;
  messages: CircleMessage[];
  quota?: DailyQuotaSnapshot;
  memberCount?: number;
}

export interface FetchMessagesParams {
  circleId: string;
  since?: string;
}

export const getCircleMessages = ({ circleId, since }: FetchMessagesParams) => {
  const params = new URLSearchParams({ circleId });
  if (since) {
    params.set('since', since);
  }
  return fetchJson<CircleMessagesResponse>(`/api/messages?${params.toString()}`);
};

export interface SendMessagePayload {
  circleId: string;
  content: string;
  deviceId?: string;
}

export interface SendMessageResponse {
  ok: true;
  message: CircleMessage;
}

export const sendMessage = (payload: SendMessagePayload) =>
  fetchJson<SendMessageResponse>('/api/messages', {
    method: 'POST',
    json: payload,
  });

export const sendTyping = (circleId: string) =>
  fetchJson<{ ok: boolean }>('/api/messages/typing', {
    method: 'POST',
    json: { circleId },
  });

export const addReaction = (messageId: string, emoji: string) =>
  fetchJson('/api/messages/reactions', {
    method: 'POST',
    json: { messageId, emoji },
  });

export const leaveCircle = () =>
  fetchJson<{ ok: boolean }>('/api/circles/leave', {
    method: 'POST',
  });
