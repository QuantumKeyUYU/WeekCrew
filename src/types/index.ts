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
  description?: string;
  weekStart: string; // ISO date string
  participantLimit: number;
  participantCount: number;
  isActive: boolean;
  icebreakers: string[];
  currentIcebreakerIndex: number;
  expiresAt: string; // ISO timestamp
}

export interface Message {
  id: string;
  circleId: string;
  authorId: string;
  authorAlias: string;
  content: string;
  type: 'text' | 'link' | 'icebreaker';
  createdAt: string; // ISO timestamp
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
