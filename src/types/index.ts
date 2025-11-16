export type MessageStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DeviceInfo {
  deviceId: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  animationsEnabled: boolean;
}

export interface MessageDTO {
  id: string;
  body: string;
  createdAt: string;
  status: MessageStatus;
  replies?: ResponseDTO[];
}

export interface ResponseDTO {
  id: string;
  body: string;
  createdAt: string;
  messageId: string;
}

export interface ResponseWithMessageDTO {
  id: string;
  body: string;
  createdAt: string;
  message: MessageDTO;
}

export interface InboxPayload {
  received: MessageDTO[];
  replied: ResponseWithMessageDTO[];
}
