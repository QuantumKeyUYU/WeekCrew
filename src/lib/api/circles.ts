import type { CircleMessage, CircleSummary, DailyQuotaSnapshot } from '@/types';
import { fetchJson } from '@/lib/api-client';

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

export const joinCircle = (payload: JoinCirclePayload) =>
  fetchJson<JoinCircleResponse>('/api/circles/join', {
    method: 'POST',
    json: payload,
  });

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
