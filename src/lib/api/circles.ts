// src/lib/api/circles.ts

import type {
  CircleMessage,
  CircleSummary,
  DailyQuotaSnapshot,
} from '@/types';
import { fetchJson } from '@/lib/api-client';

// --- вход / создание круга ---

export interface JoinCirclePayload {
  mood: string;
  interest: string;
}

export interface JoinCircleResponse {
  ok: true;
  circle: CircleSummary;
  messages: CircleMessage[];
  isNewCircle: boolean;
  quota: DailyQuotaSnapshot | null;
}

export const joinCircle = (payload: JoinCirclePayload) =>
  fetchJson<JoinCircleResponse>('/api/circles/join', {
    method: 'POST',
    json: payload,
  });

// --- сообщения ---

export interface GetCircleMessagesPayload {
  circleId: string;
  since?: string;
}

export interface GetCircleMessagesResponse {
  ok: true;
  messages: CircleMessage[];
  quota: DailyQuotaSnapshot | null;
  memberCount?: number;
  notMember?: boolean;
}

export const getCircleMessages = (payload: GetCircleMessagesPayload) =>
  fetchJson<GetCircleMessagesResponse>(
    `/api/messages?circleId=${encodeURIComponent(payload.circleId)}${
      payload.since ? `&since=${encodeURIComponent(payload.since)}` : ''
    }`,
  );

export interface SendMessagePayload {
  circleId: string;
  content: string;
}

export interface SendMessageResponse {
  ok: true;
  message: CircleMessage;
  quota: DailyQuotaSnapshot | null;
}

export const sendMessage = (payload: SendMessagePayload) =>
  fetchJson<SendMessageResponse>('/api/messages', {
    method: 'POST',
    json: payload,
  });

// --- выход из круга ---

export const leaveCircle = () =>
  fetchJson<{ ok: boolean }>('/api/circles/leave', {
    method: 'POST',
  });
