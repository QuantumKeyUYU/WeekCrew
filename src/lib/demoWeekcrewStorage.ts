import { INTERESTS_MAP } from '@/config/interests';
import { getOrCreateDeviceId, resetDeviceId } from '@/lib/device';
import { useAppStore } from '@/store/useAppStore';
import { useDemoCircleStore } from '@/store/demoCircle';
import type {
  CircleMessage,
  CircleMeta,
  InterestId,
  WeekcrewStorage,
  WeekcrewStorageSnapshot
} from '@/lib/weekcrewStorage';

const DEFAULT_MEMBERS = 6;
const DAYS_FALLBACK = 7;

const mapStateToCircle = (): CircleMeta | null => {
  const state = useDemoCircleStore.getState();
  const { currentInterestKey, joinedAt } = state;
  if (!currentInterestKey) {
    return null;
  }
  const interest = INTERESTS_MAP[currentInterestKey];
  if (!interest) {
    return null;
  }
  return {
    id: currentInterestKey,
    interestId: currentInterestKey,
    title: interest.title,
    description: interest.description,
    joinedAt,
    membersCount: DEFAULT_MEMBERS,
    daysLeft: joinedAt ? calculateDaysLeft(joinedAt) : DAYS_FALLBACK
  };
};

const calculateDaysLeft = (joinedAt: string): number => {
  const joinedDate = new Date(joinedAt).getTime();
  const weekLater = joinedDate + 7 * 24 * 60 * 60 * 1000;
  const diff = weekLater - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(days, 0);
};

const mapStateToMessages = (): CircleMessage[] => {
  const { currentInterestKey, messages } = useDemoCircleStore.getState();
  if (!currentInterestKey) {
    return [];
  }
  return messages.map((message) => ({
    id: message.id,
    circleId: currentInterestKey,
    role: message.from === 'me' ? 'me' : 'member',
    text: message.text,
    createdAt: message.time
  }));
};

const createSnapshot = (): WeekcrewStorageSnapshot => ({
  currentCircle: mapStateToCircle(),
  messages: mapStateToMessages()
});

export const createDemoWeekcrewStorage = (): WeekcrewStorage => {
  const joinDemoCircleFromInterest = async (interestId: InterestId): Promise<CircleMeta> => {
    const interestKey = interestId as keyof typeof INTERESTS_MAP;
    const interest = INTERESTS_MAP[interestKey];
    if (!interest) {
      throw new Error(`Unknown interest: ${interestId}`);
    }
    useDemoCircleStore.getState().joinInterest(interest.key);
    const circle = mapStateToCircle();
    if (!circle) {
      throw new Error('Unable to create demo circle');
    }
    return circle;
  };

  const leaveCircle = async (): Promise<void> => {
    useDemoCircleStore.getState().leaveCircle();
  };

  const listMessages = async (circleId: string): Promise<CircleMessage[]> => {
    const circle = mapStateToCircle();
    if (!circle || circle.id !== circleId) {
      return [];
    }
    return mapStateToMessages();
  };

  const sendMessage = async (circleId: string, text: string): Promise<void> => {
    const circle = mapStateToCircle();
    if (!circle || circle.id !== circleId) {
      throw new Error('Cannot send message: circle not found');
    }
    useDemoCircleStore.getState().sendMessage(text);
  };

  const clearAllLocalData = async (): Promise<void> => {
    resetDeviceId();
    const appStore = useAppStore.getState();
    const demoStore = useDemoCircleStore.getState();
    appStore.reset();
    demoStore.reset();
    const newId = getOrCreateDeviceId();
    appStore.setDevice({ deviceId: newId, createdAt: new Date().toISOString() });
  };

  return {
    getCurrentCircle: () => mapStateToCircle(),
    joinDemoCircleFromInterest,
    leaveCircle,
    listMessages,
    sendMessage,
    clearAllLocalData,
    subscribe: (listener) => useDemoCircleStore.subscribe(() => listener()),
    getSnapshot: () => createSnapshot(),
    getServerSnapshot: () => createSnapshot()
  };
};
