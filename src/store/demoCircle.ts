'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { InterestTag } from '@/types';
import { INTERESTS_MAP } from '@/config/interests';

export type DemoMessageAuthor = 'me' | 'other';

export interface DemoMessage {
  id: string;
  from: DemoMessageAuthor;
  text: string;
  time: string;
}

/* eslint-disable no-unused-vars */
interface DemoCircleState {
  currentInterestKey: InterestTag | null;
  joinedAt: string | null;
  messages: DemoMessage[];
  isDemo: true;
  joinInterest: (key: InterestTag) => void;
  leaveCircle: () => void;
  sendMessage: (text: string) => void;
  reset: () => void;
}
/* eslint-enable no-unused-vars */

const STORAGE_KEY = 'weekcrew-demo-circle-v1';

const defaultState = {
  currentInterestKey: null as InterestTag | null,
  joinedAt: null as string | null,
  messages: [] as DemoMessage[],
  isDemo: true as const
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const createInitialMessages = (key: InterestTag): DemoMessage[] => {
  const interest = INTERESTS_MAP[key];
  const base = interest?.demoMessages?.length ? interest.demoMessages : DEFAULT_MESSAGES;
  const now = Date.now();
  return base.map((text, index) => {
    const time = new Date(now - (base.length - index) * 7 * 60 * 1000).toISOString();
    return {
      id: `${key}-${index}-${generateId()}`,
      from: 'other',
      text,
      time
    };
  });
};

const DEFAULT_MESSAGES = [
  'Привет! Делюсь настроением недели.',
  'Можно писать, даже если мысль кажется маленькой.',
  'Расскажите, что сегодня принесло улыбку.'
];

const createStorage = () =>
  createJSONStorage<DemoCircleState>(() => {
    if (typeof window === 'undefined') {
      const memory: Record<string, string> = {};
      return {
        getItem: (name: string) => memory[name] ?? null,
        setItem: (name: string, value: string) => {
          memory[name] = value;
        },
        removeItem: (name: string) => {
          delete memory[name];
        }
      } as Storage;
    }
    return window.localStorage;
  });

export const useDemoCircleStore = create<DemoCircleState>()(
  persist(
    (set) => ({
      ...defaultState,
      joinInterest: (key) => {
        const nowIso = new Date().toISOString();
        const initialMessages = createInitialMessages(key);
        set((state) => ({
          currentInterestKey: key,
          joinedAt: state.currentInterestKey === key && state.joinedAt ? state.joinedAt : nowIso,
          messages: initialMessages
        }));
      },
      leaveCircle: () => {
        set({
          currentInterestKey: null,
          joinedAt: null,
          messages: []
        });
      },
      sendMessage: (text) => {
        const trimmed = text.trim();
        if (!trimmed) {
          return;
        }
        const nextMessage: DemoMessage = {
          id: generateId(),
          from: 'me',
          text: trimmed,
          time: new Date().toISOString()
        };
        set((state) => ({ messages: [...state.messages, nextMessage] }));
      },
      reset: () => set({ ...defaultState })
    }),
    {
      name: STORAGE_KEY,
      storage: createStorage()
    }
  )
);
