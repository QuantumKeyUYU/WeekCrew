// src/lib/api/circles.ts
'use client';

import type {
  CircleMessage,
  CircleSummary,
  DailyQuotaSnapshot,
} from '@/types';
import { fetchJson } from '@/lib/api-client';

// ---------- joinCircle ----------

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

// ---------- getCircleMessages ----------

export interface GetCircleMessagesPayload {
  circleId: string;
  since?: string;
}

export interface GetCircleMessagesResponse {
  messages: CircleMessage[];
  quota: DailyQuotaSnapshot | null;
  memberCount?: number;
  notMember?: boolean;
}

// Минимальный интервал между реальными запросами по одному circleId
const MIN_MESSAGES_REQUEST_INTERVAL_MS = 4000;

const messagesRateLimit = {
  lastRequestAt: new Map<string, number>(),
  inFlight: new Map<string, Promise<GetCircleMessagesResponse>>(),
};

export const getCircleMessages = (
  payload: GetCircleMessagesPayload,
): Promise<GetCircleMessagesResponse> => {
  const { circleId, since } = payload;
  const key = circleId;
  const now = Date.now();

  // Если по этому кругу уже летит запрос — просто ждём его
  const existing = messagesRateLimit.inFlight.get(key);
  if (existing) {
    return existing;
  }

  const lastAt = messagesRateLimit.lastRequestAt.get(key) ?? 0;

  // Если нас спамят вызовами чаще, чем раз в 4 секунды — отдаём "ничего нового"
  if (now - lastAt < MIN_MESSAGES_REQUEST_INTERVAL_MS) {
    return Promise.resolve({
      messages: [],
      quota: null,
      memberCount: undefined,
      notMember: false,
    });
  }

  messagesRateLimit.lastRequestAt.set(key, now);

  const params = new URLSearchParams({
    circleId,
  });

  if (since) {
    params.set('since', since);
  }

  const promise = fetchJson<GetCircleMessagesResponse>(
    `/api/messages?${params.toString()}`,
  ).finally(() => {
    messagesRateLimit.inFlight.delete(key);
  });

  messagesRateLimit.inFlight.set(key, promise);

  return promise;
};

// ---------- sendMessage ----------

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

// ---------- leaveCircle ----------

export const leaveCircle = () =>
  fetchJson<{ ok: boolean }>('/api/circles/leave', {
    method: 'POST',
  });
