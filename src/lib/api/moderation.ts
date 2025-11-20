import { fetchJson } from '@/lib/api-client';

export interface ReportPayload {
  targetUserId: string;
  circleId: string;
  messageId?: string;
  reason?: string;
}

export interface BlockPayload {
  targetUserId: string;
}

export const sendReport = (payload: ReportPayload) =>
  fetchJson<{ ok: true }>('/api/report', {
    method: 'POST',
    json: payload,
  });

export const blockUser = (payload: BlockPayload) =>
  fetchJson<{ ok: true }>('/api/block', {
    method: 'POST',
    json: payload,
  });
