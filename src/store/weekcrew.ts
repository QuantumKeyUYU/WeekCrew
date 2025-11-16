'use client';

import { create } from 'zustand';

const STORAGE_KEY = 'weekcrew-demo-v1';

export type WeekcrewMode = 'idle' | 'matching' | 'active';
export type WeekcrewAuthor = 'me' | 'other';

export interface WeekcrewMessage {
  id: string;
  author: WeekcrewAuthor;
  text: string;
  createdAt: string;
}

interface WeekcrewDataState {
  mode: WeekcrewMode;
  selectedInterest: string | null;
  circleId: string | null;
  membersCount: number;
  startedAt: string;
  endsAt: string;
  messages: WeekcrewMessage[];
}

/* eslint-disable no-unused-vars */
interface WeekcrewStore extends WeekcrewDataState {
  startMatching: (interestKey: string) => void;
  finishMatching: () => void;
  postMessage: (text: string) => void;
  resetCircle: () => void;
}
/* eslint-enable no-unused-vars */

const defaultState: WeekcrewDataState = {
  mode: 'idle',
  selectedInterest: null,
  circleId: null,
  membersCount: 0,
  startedAt: '',
  endsAt: '',
  messages: []
};

const DEFAULT_OTHER_MESSAGES = [
  'Привет! Очень жду, когда все поделятся идеями на эту неделю ✨',
  'Сегодня пробовала новый формат заметок — могу рассказать, если интересно!',
  'Как у вас настроение? Я хочу успеть закончить маленький проект до выходных.'
];

const DAYS_IN_CIRCLE = 7;

const loadState = (): WeekcrewDataState => {
  if (typeof window === 'undefined') {
    return defaultState;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultState;
    }
    const parsed = JSON.parse(stored);
    return {
      ...defaultState,
      ...parsed,
      messages: Array.isArray(parsed?.messages) ? parsed.messages : defaultState.messages
    };
  } catch (error) {
    console.warn('Failed to read weekcrew state', error);
    return defaultState;
  }
};

const persistState = (state: WeekcrewDataState) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to persist weekcrew state', error);
  }
};

const pickDataState = (state: WeekcrewStore): WeekcrewDataState => ({
  mode: state.mode,
  selectedInterest: state.selectedInterest,
  circleId: state.circleId,
  membersCount: state.membersCount,
  startedAt: state.startedAt,
  endsAt: state.endsAt,
  messages: state.messages
});

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const createInitialMessages = (referenceDate: Date): WeekcrewMessage[] => {
  return DEFAULT_OTHER_MESSAGES.map((text, index) => {
    const createdAt = new Date(referenceDate.getTime() - (DEFAULT_OTHER_MESSAGES.length - index) * 15 * 60 * 1000);
    return {
      id: generateId(),
      author: 'other',
      text,
      createdAt: createdAt.toISOString()
    };
  });
};

const randomMembersCount = () => 5 + Math.floor(Math.random() * 3);

export const useWeekcrewStore = create<WeekcrewStore>((set, get) => ({
  ...loadState(),
  startMatching: (interestKey) => {
    const now = new Date();
    const endsAt = new Date(now.getTime() + DAYS_IN_CIRCLE * 24 * 60 * 60 * 1000);
    const nextState: WeekcrewDataState = {
      mode: 'matching',
      selectedInterest: interestKey,
      circleId: generateId(),
      membersCount: randomMembersCount(),
      startedAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
      messages: createInitialMessages(now)
    };
    set(nextState);
    persistState(nextState);
  },
  finishMatching: () => {
    if (get().mode !== 'matching') {
      return;
    }
    set({ mode: 'active' });
    persistState({ ...pickDataState(get()), mode: 'active' });
  },
  postMessage: (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    set((state) => {
      const nextMessages = [
        ...state.messages,
        {
          id: generateId(),
          author: 'me',
          text: trimmed,
          createdAt: new Date().toISOString()
        }
      ];
      const nextState = { ...pickDataState(state), messages: nextMessages };
      persistState(nextState);
      return { messages: nextMessages };
    });
  },
  resetCircle: () => {
    set(defaultState);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
}));
