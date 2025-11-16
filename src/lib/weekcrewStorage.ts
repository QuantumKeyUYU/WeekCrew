import { useSyncExternalStore } from 'react';
import type { InterestTag } from '@/types';
import { isDemoMode } from '@/config/mode';
import { createDemoWeekcrewStorage } from '@/lib/demoWeekcrewStorage';
import { createLiveWeekcrewStorage } from '@/lib/liveWeekcrewStorage';

type PrimitiveInterestId = InterestTag | string;

export type InterestId = PrimitiveInterestId;

export type CircleMessageRole = 'host' | 'member' | 'me';

export interface CircleMeta {
  id: string;
  interestId: InterestId;
  title: string;
  description: string;
  joinedAt: string | null;
  membersCount?: number;
  daysLeft?: number;
}

export interface CircleMessage {
  id: string;
  circleId: string;
  role: CircleMessageRole;
  text: string;
  createdAt: string;
}

export interface WeekcrewStorageSnapshot {
  currentCircle: CircleMeta | null;
  messages: CircleMessage[];
}

/* eslint-disable no-unused-vars */
export interface WeekcrewStorage {
  getCurrentCircle(): CircleMeta | null;
  joinDemoCircleFromInterest(interestId: InterestId): Promise<CircleMeta>;
  leaveCircle(): Promise<void>;
  listMessages(circleId: string): Promise<CircleMessage[]>;
  sendMessage(circleId: string, text: string): Promise<void>;
  clearAllLocalData(): Promise<void>;
  subscribe(listener: () => void): () => void;
  getSnapshot(): WeekcrewStorageSnapshot;
  getServerSnapshot(): WeekcrewStorageSnapshot;
}
/* eslint-enable no-unused-vars */

let storageInstance: WeekcrewStorage | null = null;

const createStorage = (): WeekcrewStorage => {
  if (isDemoMode) {
    return createDemoWeekcrewStorage();
  }
  return createLiveWeekcrewStorage();
};

export const getWeekcrewStorage = (): WeekcrewStorage => {
  if (!storageInstance) {
    storageInstance = createStorage();
  }
  return storageInstance;
};

export const useWeekcrewStorage = (): WeekcrewStorage => getWeekcrewStorage();

// eslint-disable-next-line no-unused-vars
export const useWeekcrewSnapshot = <T,>(selector: (snapshot: WeekcrewStorageSnapshot) => T): T => {
  const storage = getWeekcrewStorage();
  return useSyncExternalStore(
    storage.subscribe,
    () => selector(storage.getSnapshot()),
    () => selector(storage.getServerSnapshot())
  );
};
