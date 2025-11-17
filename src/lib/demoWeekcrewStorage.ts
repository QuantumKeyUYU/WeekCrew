import type {
  CircleMeta,
  CircleMessage,
  WeekcrewStorage,
  WeekcrewStorageSnapshot,
  InterestId,
} from '@/lib/weekcrewStorage';

const DEMO_STATE_KEY = 'weekcrew:demo-snapshot-v1';
const DEMO_CIRCLE_ID = 'demo-circle';
const isBrowser = typeof window !== 'undefined';

/* ---------- helper'ы ---------- */

const createEmptySnapshot = (): WeekcrewStorageSnapshot => ({
  currentCircle: null,
  messages: [],
});

const createDemoCircle = (interestId: InterestId): CircleMeta => ({
  id: DEMO_CIRCLE_ID,
  interestId,
  title: 'Демо-круг поддержки',
  description: 'Это демо-комната WeekCrew. Здесь можно безопасно потыкать интерфейс.',
  joinedAt: new Date().toISOString(),
  membersCount: 5,
  daysLeft: 3,
});

const createInitialMessages = (): CircleMessage[] => [
  {
    id: 'm1',
    circleId: DEMO_CIRCLE_ID,
    role: 'member',
    text: 'Иногда бывает тяжело, но чужие слова поддержки правда помогают.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'm2',
    circleId: DEMO_CIRCLE_ID,
    role: 'member',
    text: 'В этом кружке можно просто побыть собой. Никто не обязан быть «сильным».',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'm3',
    circleId: DEMO_CIRCLE_ID,
    role: 'host',
    text: 'Добро пожаловать в демо WeekCrew ✨ Напиши любое сообщение, чтобы увидеть, как всё работает.',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

type SnapshotUpdater = (prev: WeekcrewStorageSnapshot) => WeekcrewStorageSnapshot;

/* ---------- bot-сообщения ---------- */

const BOT_REPLIES: string[] = [
  'Звучит очень по-человечески. Спасибо, что поделился 💜',
  'Ты вообще не обязан чувствовать себя «нормально» 24/7. Мы тут как раз для этого.',
  'Иногда лучший прогресс — это просто дожить до вечера и дать себе отдохнуть.',
  'Классно, что ты это сформулировал словами. Это уже маленький шаг вперёд.',
  'Всем нам иногда нужен кто-то, кто скажет: «с тобой всё в порядке». Считай, я сказал 😊',
  'Можно просто написать «я устал(а)», и этого достаточно. Не обязательно быть продуктивным.',
  'То, что ты сейчас здесь и читаешь это — уже забота о себе.',
];

const pickRandomReply = (): string => {
  if (!BOT_REPLIES.length) return 'Спасибо, что поделился. Я рядом 👀';
  const index = Math.floor(Math.random() * BOT_REPLIES.length);
  return BOT_REPLIES[index];
};

/* ---------- работа с localStorage ---------- */

const persistSnapshot = (snapshot: WeekcrewStorageSnapshot) => {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('[demo] Failed to persist snapshot', error);
  }
};

const restoreSnapshot = (): WeekcrewStorageSnapshot | null => {
  if (!isBrowser) return null;

  try {
    const raw = window.localStorage.getItem(DEMO_STATE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as WeekcrewStorageSnapshot;

    if (
      parsed &&
      typeof parsed === 'object' &&
      'currentCircle' in parsed &&
      'messages' in parsed &&
      Array.isArray(parsed.messages)
    ) {
      return parsed;
    }
  } catch (error) {
    console.warn('[demo] Failed to restore snapshot', error);
  }

  return null;
};

const clearPersistedSnapshot = () => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(DEMO_STATE_KEY);
  } catch (error) {
    console.warn('[demo] Failed to clear persisted snapshot', error);
  }
};

/* ---------- сам стор ---------- */

export const createDemoWeekcrewStorage = (): WeekcrewStorage => {
  const listeners = new Set<() => void>();
  let snapshot: WeekcrewStorageSnapshot = createEmptySnapshot();

  // поднять сохранённое состояние, если есть
  const restored = restoreSnapshot();
  if (restored) {
    snapshot = restored;
  }

  const notify = () => {
    listeners.forEach((l) => l());
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
      persistSnapshot(snapshot);
      notify();
    }
  };

  const scheduleBotReply = (lastUserText: string) => {
    if (!isBrowser) return; // на сервере таймеры не создаём

    // лёгкий «анти-спам» — если нет кружка, не отвечаем
    if (!snapshot.currentCircle) return;

    const delay = 1200 + Math.random() * 2000; // 1.2–3.2 сек

    setTimeout(() => {
      // ещё раз проверим, что кружок жив
      if (!snapshot.currentCircle) return;

      const now = new Date().toISOString();
      const replyText = pickRandomReply();

      const botMessage: CircleMessage = {
        id: `bot-${now}-${Math.random().toString(36).slice(2)}`,
        circleId: snapshot.currentCircle.id,
        role: 'member',
        text: replyText,
        createdAt: now,
      };

      updateSnapshot((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    }, delay);
  };

  const joinDemoCircleFromInterest = async (
    interestId: InterestId,
  ): Promise<CircleMeta> => {
    const circle: CircleMeta = createDemoCircle(interestId);

    const baseMessages =
      snapshot.currentCircle && snapshot.currentCircle.id === circle.id
        ? snapshot.messages
        : createInitialMessages();

    updateSnapshot(() => ({
      currentCircle: circle,
      messages: baseMessages,
    }));

    return circle;
  };

  const leaveCircle = async (): Promise<void> => {
    updateSnapshot(() => createEmptySnapshot());
  };

  const listMessages = async (_circleId: string): Promise<CircleMessage[]> => {
    return snapshot.messages;
  };

  const sendMessage = async (_circleId: string, text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!snapshot.currentCircle) {
      return;
    }

    const now = new Date().toISOString();

    const userMessage: CircleMessage = {
      id: `demo-${now}-${Math.random().toString(36).slice(2)}`,
      circleId: snapshot.currentCircle.id,
      role: 'me',
      text: trimmed,
      createdAt: now,
    };

    // сначала добавляем сообщение пользователя
    updateSnapshot((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    // потом планируем ответ «бота»
    scheduleBotReply(trimmed);
  };

  const clearAllLocalData = async (): Promise<void> => {
    clearPersistedSnapshot();
    updateSnapshot(() => createEmptySnapshot());
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const getSnapshot = () => snapshot;

  const SERVER_SNAPSHOT: WeekcrewStorageSnapshot = createEmptySnapshot();
  const getServerSnapshot = () => SERVER_SNAPSHOT;

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
