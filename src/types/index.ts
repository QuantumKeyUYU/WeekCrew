export type InterestTag =
  | 'kpop'
  | 'anime'
  | 'drama'
  | 'psychology'
  | 'books'
  | 'it'
  | 'games'
  | 'music'
  | 'movies'
  | 'custom';

export type InterestId = InterestTag | string;

export type CircleStatus = 'active' | 'finished' | 'archived';

export interface UserProfile {
  id: string;
  deviceId: string;
  nickname: string;
  avatarKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface CircleSummary {
  id: string;
  mood: string;
  interest: InterestId;
  startsAt: string;
  expiresAt: string;
  status: CircleStatus;
  maxMembers: number;
  memberCount: number;
  remainingMs: number;
  isExpired: boolean;
  icebreaker: string;
}

export interface MessageAuthor {
  id: string | null;
  nickname?: string | null;
  avatarKey?: string | null;
}

export interface CircleMessage {
  id: string;
  circleId: string;
  deviceId: string | null;
  author?: MessageAuthor | null;
  content: string;
  isSystem: boolean;
  createdAt: string;
}

export interface AppSettings {
  language: 'ru' | 'en';
  theme: 'light' | 'dark' | 'system';
  animationsEnabled: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  createdAt: string;
}

export interface DailyQuotaSnapshot {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  resetAtIso: string;
}
