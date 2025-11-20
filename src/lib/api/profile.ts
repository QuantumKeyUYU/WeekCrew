import type { UserProfile } from '@/types';
import { fetchJson } from '@/lib/api-client';

export interface ProfilePayload {
  nickname: string;
  avatarKey: string;
}

export interface ProfileResponse {
  user: UserProfile | null;
}

export const getProfile = () => fetchJson<ProfileResponse>('/api/profile');

export const saveProfile = (payload: ProfilePayload) =>
  fetchJson<ProfileResponse>('/api/profile', {
    method: 'POST',
    json: payload,
  });
