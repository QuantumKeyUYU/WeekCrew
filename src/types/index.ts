import type { Timestamp } from 'firebase/firestore';

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

export type CircleStatus = 'active' | 'archived';

export interface UserProfile {
  id: string;
  nickname?: string;
  interests: InterestTag[];
  currentCircleId?: string | null;
  locale: 'ru' | 'en';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
}

export interface Circle {
  id: string;
  interest: InterestTag;
  title: string;
  status: CircleStatus;
  capacity: number;
  memberIds: string[];
  createdAt: Timestamp;
  expiresAt: Timestamp;
  icebreakerSeed?: string;
}

export interface CircleMessage {
  id: string;
  circleId: string;
  authorDeviceId: string;
  text: string;
  createdAt: Timestamp;
  authorAlias?: string;
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
