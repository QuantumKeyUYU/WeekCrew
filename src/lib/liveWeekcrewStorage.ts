import { getOrCreateDeviceId, resetDeviceId } from '@/lib/device';
import { useAppStore } from '@/store/useAppStore';
import type {
  CircleMessage,
  CircleMeta,
  InterestId,
  WeekcrewStorage,
  WeekcrewStorageSnapshot
} from '@/lib/weekcrewStorage';

const MEMBERS_FALLBACK = 6;
const DAYS_FALLBACK = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const LIVE_STATE_KEY = 'weekcrew:live-circle-state-v1';

const createEmptySnapshot = (): WeekcrewStorageSnapshot => ({ currentCircle: null, messages: [] });

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
  body: string;
  authorDeviceId: string | null;
  createdAt: string;
};

type PersistedState = {
  currentCircle: CircleMeta;
};

type ErrorResponse = {
  ok: false;
  error: string;
  message?: string;
};

type FetchRequestInit = Parameters<typeof fetch>[1];

type CircleResponse = {
  ok: true;
  circle: ApiCircle;
};

type MessageListResponse = {
  ok: true;
  messages: ApiMessage[];
};

type MessageCreateResponse = {
  ok: true;
  message: ApiMessage;
};

// eslint-disable-next-line no-unused-vars
type SnapshotUpdater = (state: WeekcrewStorageSnapshot) => WeekcrewStorageSnapshot;

const calculateDaysLeft = (joinedAt: string | null, expiresAt?: string | null): number => {
  const joined = joinedAt ? new Date(joinedAt).getTime() : Date.now();
  const deadline = expiresAt ? new Date(expiresAt).getTime() : joined + DAYS_FALLBACK * DAY_MS;
  const diff = deadline - Date.now();
  if (!Number.isFinite(diff)) {
    return DAYS_FALLBACK;
  }
  return Math.max(0, Math.ceil(diff / DAY_MS));
};

const mapCircleMeta = (circle: ApiCircle, joinedAt: string | null): CircleMeta => ({
  id: circle.id,
  interestId: circle.interestId,
  title: circle.title,
  description: circle.description ?? '',
  joinedAt,
  membersCount: circle.memberCount ?? MEMBERS_FALLBACK,
  daysLeft: calculateDaysLeft(joinedAt, circle.expiresAt ?? null)
});

const mapMessage = (message: ApiMessage, deviceId: string): CircleMessage => ({
  id: message.id,
  circleId: message.circleId,
  role: message.authorDeviceId && message.authorDeviceId === deviceId ? 'me' : 'member',
  text: message.body,
  createdAt: message.createdAt
});

const readPersistedCircle = (): CircleMeta | null => {
  if (!isBrowser) {
    return null;
  }
  const raw = window.localStorage.getItem(LIVE_STATE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as PersistedState;
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
  const payload: PersistedState = { currentCircle: circle };
  window.localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(payload));
};

const requestJson = async <T>(input: string, init?: FetchRequestInit): Promise<T> => {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => null)) as T | ErrorResponse | null;

  if (!response.ok) {
    const message = (payload as ErrorResponse | null)?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (payload && typeof (payload as any).ok === 'boolean' && !(payload as any).ok) {
    throw new Error((payload as ErrorResponse).message ?? 'Request returned an error');
  }

  if (!payload) {
    throw new Error('EMPTY_RESPONSE');
  }

  return payload as T;
};

export const createLiveWeekcrewStorage = (): WeekcrewStorage => {
  const listeners = new Set<() => void>();
  let snapshot: WeekcrewStorageSnapshot = createEmptySnapshot();
  let deviceId = isBrowser ? getOrCreateDeviceId() : 'server-device';

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const updateSnapshot = (updater: SnapshotUpdater) => {
    const prev = snapshot;
    const next = updater(prev);
    if (next === prev) {
      return;
    }
    const changed =
      prev.currentCircle !== next.currentCircle ||
      prev.messages !== next.messages;
    snapshot = next;
    if (changed) {
      notify();
    }
  };

  const refreshMessages = async (circleId: string): Promise<CircleMessage[]> => {
    const search = new URLSearchParams({ circleId });
    const data = await requestJson<MessageListResponse>(`/api/message?${search.toString()}`, {
      cache: 'no-store'
    });
    const nextMessages = data.messages
      .map((message) => mapMessage(message, deviceId))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    updateSnapshot((prev) => {
      if (!prev.currentCircle || prev.currentCircle.id !== circleId) {
        return prev;
      }
      return { ...prev, messages: nextMessages };
    });

    return nextMessages;
  };

  const fetchCircleByInterest = async (interestId: InterestId): Promise<ApiCircle> => {
    const search = new URLSearchParams({ interestId: String(interestId) });
    const data = await requestJson<CircleResponse>(`/api/circle?${search.toString()}`, {
      cache: 'no-store'
    });
    return data.circle;
  };

  const fetchCircleById = async (circleId: string): Promise<ApiCircle | null> => {
    const search = new URLSearchParams({ circleId });
    try {
      const data = await requestJson<CircleResponse>(`/api/circle?${search.toString()}`, {
        cache: 'no-store'
      });
      return data.circle;
    } catch (error) {
      console.warn('Failed to fetch circle by id', error);
      return null;
    }
  };

  const joinDemoCircleFromInterest = async (interestId: InterestId): Promise<CircleMeta> => {
    const circle = await fetchCircleByInterest(interestId);
    const joinedAt = new Date().toISOString();
    const meta = mapCircleMeta(circle, joinedAt);

    persistCircle(meta);
    updateSnapshot(() => ({ currentCircle: meta, messages: [] }));
    await refreshMessages(circle.id).catch((error) => {
      console.warn('Failed to fetch live messages after join', error);
    });
    return meta;
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
    if (!trimmed) {
      return;
    }
    const payload = await requestJson<MessageCreateResponse>(`/api/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circleId, body: trimmed, authorDeviceId: deviceId ?? null })
    });
    const message = mapMessage(payload.message, deviceId);
    updateSnapshot((prev) => {
      if (!prev.currentCircle || prev.currentCircle.id !== circleId) {
        return prev;
      }
      return { ...prev, messages: [...prev.messages, message] };
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

  const getSnapshot = () => snapshot;
  const getServerSnapshot = () => createEmptySnapshot();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  if (isBrowser) {
    const persisted = readPersistedCircle();
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
      hydrate().catch((error) => console.warn('Failed to hydrate live storage', error));
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
    getServerSnapshot
  };
};
