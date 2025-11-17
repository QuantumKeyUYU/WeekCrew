// Общие доменные типы для backend-слоя WeekCrew

export type InterestId = string;

export interface Circle {
  id: string;
  interestId: InterestId;
  title: string;
  description?: string;
  createdAt: string; // ISO
  expiresAt?: string; // ISO
  memberCount: number;
}

export interface CircleMessage {
  id: string;
  circleId: string;
  body: string;
  authorDeviceId: string | null;
  createdAt: string; // ISO
}

export interface NewMessageInput {
  circleId: string;
  body: string;
  authorDeviceId: string | null;
}
