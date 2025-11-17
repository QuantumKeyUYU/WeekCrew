import { getOrCreateDeviceId, resetDeviceId } from '@/lib/device';
import { useAppStore } from '@/store/useAppStore';
import type {
  CircleMessage,
  CircleMeta,
  InterestId,
  WeekcrewStorage,
  WeekcrewStorageSnapshot,
} from '@/lib/weekcrewStorage';

const MEMBERS_FALLBACK = 6;
const DAYS_FALLBACK = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const LIVE_STATE_KEY = 'weekcrew:live-circle-state-v1';

const createEmptySnapshot = (): WeekcrewStorageSnapshot => ({
  currentCircle: null,
  messages: [],
});

const isBrowser = typeof window !== 'undefined';

type ApiCircle = {
  id: string;
  interestId: InterestId;
  title: string;
  description?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  memberCount?: number;
};

type ApiMessage = {
  id: string;
  circleId: string;
  role: 'host' | 'member' | 'me';
  text: string;
  createdAt: string;
};

type CircleResponse = { circle: ApiCircle };
type MessagesResponse = { messages: ApiMessage[] };
type MessageCreateResponse = { message: ApiMessage };

type SnapshotUpdater = (prev: WeekcrewStorageSnapshot) => WeekcrewStorageSnapshot;

const requestJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
};

// 🔧 ВАЖНО: теперь ВСЕГДА возвращает CircleMeta, без null
const mapCircleMeta = (circle: ApiCircle, joinedAt: string | null): CircleMeta => {
  let daysLeft = DAYS_FALLBACK;

  if (circle.expiresAt) {
    const now = Date.now();
    const expires = new Date(circle.expiresAt).getTime();
    const diff = Math.max(expires - now, 0);
    daysLeft = Math.max(1, Math.round(diff / DAY_MS));
  }

  return {
    id: circle.id,
    interestId: circle.interestId,
    title: circle.title,
    description: circle.description ?? 'Еженедельный круг WeekCrew',
    joinedAt,
    membersCount: circle.memberCount ?? MEMBERS_FALLBACK,
    daysLeft,
  };
};

const restoreCircleFromStorage = (): CircleMeta | null => {
  if (!isBrowser) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LIVE_STATE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as WeekcrewStorageSnapshot;
    if (parsed?.currentCircle?.id) {
      return parsed.currentCircle;
    }
  } catch (error) {
    console.warn('Failed to parse live storage snapshot', error);
  }
  return null;
};

const persistCircle = (circle: CircleMeta | null) => {
  if (!isBrowser) {
    return;
  }
  if (!circle) {
    window.localStorage.removeItem(LIVE_STATE_KEY);
    return;
  }
  const snapshot: WeekcrewStorageSnapshot = {
    currentCircle: circle,
    messages: [],
  };
  try {
    window.localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Failed to persist live circle snapshot', error);
  }
};

export const createLiveWeekcrewStorage = (): WeekcrewStorage => {
  const listeners = new Set<() => void>();
  let snapshot: WeekcrewStorageSnapshot = createEmptySnapshot();
  let deviceId: string = isBrowser ? getOrCreateDeviceId() : 'server-device';

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const updateSnapshot = (updater: SnapshotUpdater) => {
    const prev = snapshot;
    const next = updater(prev);

    if (next === prev) return;

    const changed =
      prev.currentCircle !== next.currentCircle ||
      prev.messages !== next.messages;

    snapshot = next;

    if (changed) {
      notify();
    }
  };

  const getSnapshot = () => snapshot;

  const getServerSnapshot = () => createEmptySnapshot();

  const refreshMessages = async (circleId: string): Promise<CircleMessage[]> => {
    try {
      const search = new URLSearchParams({ circleId });
      const data = await requestJson<MessagesResponse>(
        `/api/messages?${search.toString()}`,
        { cache: 'no-store' },
      );

      const mapped: CircleMessage[] = data.messages.map((msg) => ({
        id: msg.id,
        circleId: msg.circleId,
        role: msg.role,
        text: msg.text,
        createdAt: msg.createdAt,
      }));

      updateSnapshot((prev) => ({
        ...prev,
        messages: mapped,
      }));

      return mapped;
    } catch (error) {
      console.warn('Failed to fetch live messages', error);
      return snapshot.messages;
    }
  };

  const fetchCircleByInterest = async (interestId: InterestId): Promise<ApiCircle> => {
    const search = new URLSearchParams({ interestId: String(interestId) });
    const data = await requestJson<CircleResponse>(
      `/api/circle?${search.toString()}`,
      { cache: 'no-store' },
    );
    return data.circle;
  };

  const fetchCircleById = async (circleId: string): Promise<ApiCircle | null> => {
    const search = new URLSearchParams({ circleId });
    try {
      const data = await requestJson<CircleResponse>(
        `/api/circle?${search.toString()}`,
        { cache: 'no-store' },
      );
      return data.circle;
    } catch (error) {
      console.warn('Failed to fetch circle by id', error);
      return null;
    }
  };

  const joinDemoCircleFromInterest = async (
    interestId: InterestId,
  ): Promise<CircleMeta> => {
    const circle = await fetchCircleByInterest(interestId); // ApiCircle, не null
    const joinedAt = new Date().toISOString();
    const meta = mapCircleMeta(circle, joinedAt);           // CircleMeta, не null

    persistCircle(meta);
    updateSnapshot(() => ({ currentCircle: meta, messages: [] }));

    await refreshMessages(circle.id).catch((error) => {
      console.warn('Failed to fetch live messages after join', error);
    });

    return meta; // ✅ теперь тип строго CircleMeta, TS не будет ругаться
  };

  const leaveCircle = async (): Promise<void> => {
    persistCircle(null);
    updateSnapshot(() => createEmptySnapshot());
  };

  const listMessages = async (circleId: string): Promise<CircleMessage[]> => {
    return refreshMessages(circleId);
  };

  const sendMessage = async (circleId: string, text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const payload = await requestJson<MessageCreateResponse>(`/api/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        circleId,
        deviceId,
        text: trimmed,
      }),
    });

    const message: CircleMessage = {
      id: payload.message.id,
      circleId: payload.message.circleId,
      role: payload.message.role,
      text: payload.message.text,
      createdAt: payload.message.createdAt,
    };

    updateSnapshot((prev) => {
      if (!prev.currentCircle || prev.currentCircle.id !== circleId) {
        return prev;
      }
      return {
        ...prev,
        messages: [...prev.messages, message],
      };
    });
  };

  const clearAllLocalData = async (): Promise<void> => {
    await leaveCircle();
    resetDeviceId();
    deviceId = isBrowser ? getOrCreateDeviceId() : 'server-device';

    const appStore = useAppStore.getState();
    appStore.reset();
    appStore.setDevice({ deviceId, createdAt: new Date().toISOString() });
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  if (isBrowser) {
    const persisted = restoreCircleFromStorage();
    if (persisted) {
      snapshot = { currentCircle: persisted, messages: [] };

      const hydrate = async () => {
        const circle = await fetchCircleById(persisted.id);
        if (circle) {
          const meta = mapCircleMeta(circle, persisted.joinedAt);
          persistCircle(meta);
          updateSnapshot((prev) => ({ ...prev, currentCircle: meta }));
        }
        await refreshMessages(persisted.id);
      };

      hydrate().catch((error) =>
        console.warn('Failed to hydrate live storage', error),
      );
    }
  }

  return {
    getCurrentCircle: () => snapshot.currentCircle,
    joinDemoCircleFromInterest,
    leaveCircle,
    listMessages,
    sendMessage,
    clearAllLocalData,
    subscribe,
    getSnapshot,
    getServerSnapshot,
  };
};
