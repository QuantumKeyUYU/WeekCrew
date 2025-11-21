'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppSettings,
  CircleSummary,
  CircleMessage,
  DailyQuotaSnapshot,
  DeviceInfo,
  UserProfile,
} from '@/types';

/* eslint-disable no-unused-vars */
interface AppStore {
  device: DeviceInfo | null;
  user: UserProfile | null;
  blockedUserIds: string[];
  circle: CircleSummary | null;
  messages: CircleMessage[];
  dailyLimit: number | null;
  dailyUsed: number | null;
  dailyRemaining: number | null;
  quotaResetAtIso: string | null;
  isDailyQuotaExhausted: boolean;
  settings: AppSettings;
  firebaseReady: boolean;
  setDevice(device: DeviceInfo): void;
  setUser(profile: UserProfile | null): void;
  updateUser(updater: (prev: UserProfile | null) => UserProfile | null): void;
  setCircle(circle: CircleSummary | null): void;
  updateCircle(updater: (prev: CircleSummary | null) => CircleSummary | null): void;
  setMessages(messages: CircleMessage[]): void;
  addMessage(message: CircleMessage): void;
  replaceMessage(tempId: string, message: CircleMessage): void;
  removeMessage(id: string): void;
  removeMessagesByUser(userId: string): void;
  blockUserLocally(userId: string): void;
  setQuotaFromApi(quota: DailyQuotaSnapshot | null): void;
  updateSettings(settings: Partial<AppSettings>): void;
  setFirebaseReady(ready: boolean): void;
  profileModalOpen: boolean;
  profileModalCallback: (() => void | Promise<void>) | null;
  openProfileModal(callback?: () => void | Promise<void>): void;
  closeProfileModal(): void;
  completeProfile(profile: UserProfile): void;
  clearSession(): void;
  reset(): void;
}
/* eslint-enable no-unused-vars */

const defaultSettings: AppSettings = {
  language: 'ru',
  theme: 'system',
  animationsEnabled: true,
};

const filterBlockedMessages = (messages: CircleMessage[], blockedIds: string[]) =>
  messages.filter((message) => {
    const authorId = message.author?.id;
    if (!authorId) return true;
    return !blockedIds.includes(authorId);
  });

const sortMessages = (messages: CircleMessage[]) =>
  [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

const prepareMessages = (
  messages: CircleMessage[],
  blockedUserIds: string[],
) => sortMessages(filterBlockedMessages(messages, blockedUserIds));

const memoryStorage = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: (name: string) => storage[name] ?? null,
    setItem: (name: string, value: string) => {
      storage[name] = value;
    },
    removeItem: (name: string) => {
      delete storage[name];
    }
  };
})();

const storage = createJSONStorage<AppStore>(() => {
  if (typeof window === 'undefined') {
    return memoryStorage as Storage;
  }
  return window.localStorage;
});

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        device: null,
        user: null,
        blockedUserIds: [],
        circle: null,
        messages: [],
        dailyLimit: null,
        dailyUsed: null,
        dailyRemaining: null,
        quotaResetAtIso: null,
        isDailyQuotaExhausted: false,
        settings: defaultSettings,
        firebaseReady: false,
        setDevice: (device) => set({ device }),
        setUser: (profile) => set({ user: profile }),
        updateUser: (updater) => set({ user: updater(get().user) }),
        setCircle: (circle) => set({ circle }),
        updateCircle: (updater) => set((state) => ({ circle: updater(state.circle) })),
        setMessages: (messages) =>
          set((state) => ({
            messages: prepareMessages(messages, state.blockedUserIds),
          })),
        addMessage: (message) =>
          set((state) => ({
            messages: prepareMessages([...state.messages, message], state.blockedUserIds),
          })),
        replaceMessage: (tempId, message) =>
          set((state) => {
            let didReplace = false;
            const updated = state.messages.map((existing) => {
              if (existing.id === tempId) {
                didReplace = true;
                return message;
              }
              return existing;
            });

            const nextMessages = didReplace
              ? updated
              : [...state.messages, message];

            return {
              messages: prepareMessages(nextMessages, state.blockedUserIds),
            };
          }),
        removeMessage: (id) =>
          set((state) => ({
            messages: state.messages.filter((message) => message.id !== id),
          })),
        removeMessagesByUser: (userId) =>
          set((state) => ({
            messages: state.messages.filter((message) => message.author?.id !== userId),
          })),
        blockUserLocally: (userId) =>
          set((state) => {
            if (state.blockedUserIds.includes(userId)) {
              return state;
            }
            const blockedUserIds = [...state.blockedUserIds, userId];
            return {
              blockedUserIds,
              messages: state.messages.filter((message) => message.author?.id !== userId),
            };
          }),
        setQuotaFromApi: (quota) =>
          set(() => {
            if (!quota) {
              return {
                dailyLimit: null,
                dailyUsed: null,
                dailyRemaining: null,
                quotaResetAtIso: null,
                isDailyQuotaExhausted: false,
              };
            }
            return {
              dailyLimit: quota.dailyLimit,
              dailyUsed: quota.usedToday,
              dailyRemaining: quota.remainingToday,
              quotaResetAtIso: quota.resetAtIso,
              isDailyQuotaExhausted: quota.remainingToday <= 0,
            };
          }),
        updateSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),
        setFirebaseReady: (ready) => set({ firebaseReady: ready }),
        profileModalOpen: false,
        profileModalCallback: null,
        openProfileModal: (callback) => set({ profileModalOpen: true, profileModalCallback: callback ?? null }),
        closeProfileModal: () => set({ profileModalOpen: false, profileModalCallback: null }),
        completeProfile: (profile) => {
          const callback = get().profileModalCallback;
          set({ user: profile, profileModalOpen: false, profileModalCallback: null });
          callback?.();
        },
        clearSession: () =>
          set({
            device: null,
            user: null,
            blockedUserIds: [],
            circle: null,
            messages: [],
            dailyLimit: null,
            dailyUsed: null,
            dailyRemaining: null,
            quotaResetAtIso: null,
            isDailyQuotaExhausted: false,
            firebaseReady: false,
          }),
        reset: () => set({
          device: null,
          user: null,
          blockedUserIds: [],
          circle: null,
          messages: [],
          dailyLimit: null,
          dailyUsed: null,
          dailyRemaining: null,
          quotaResetAtIso: null,
          isDailyQuotaExhausted: false,
          settings: defaultSettings
        })
      }),
      {
        name: 'weekcrew-store',
        storage,
        version: 3,
        migrate: (persistedState) => {
          if (!persistedState || typeof persistedState !== 'object') {
            return persistedState as AppStore;
          }
          const { settings = defaultSettings } = persistedState as Partial<AppStore>;
          return {
            ...persistedState,
            settings,
            circle: null,
            device: null,
            user: null,
            blockedUserIds: [],
            messages: [],
            dailyLimit: null,
            dailyUsed: null,
            dailyRemaining: null,
            quotaResetAtIso: null,
            isDailyQuotaExhausted: false,
            firebaseReady: false,
          } as AppStore;
        },
        partialize: (state) => ({
          settings: state.settings,
          blockedUserIds: state.blockedUserIds,
        }),
      }
    )
  )
);
