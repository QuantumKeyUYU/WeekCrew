import type { WeekcrewStorage } from '@/lib/weekcrewStorage';

const notImplemented = (): never => {
  throw new Error('Live storage is not implemented yet');
};

export const createLiveWeekcrewStorage = (): WeekcrewStorage => ({
  getCurrentCircle: () => null,
  joinDemoCircleFromInterest: async () => notImplemented(),
  leaveCircle: async () => notImplemented(),
  listMessages: async () => notImplemented(),
  sendMessage: async () => notImplemented(),
  clearAllLocalData: async () => notImplemented(),
  subscribe: () => {
    notImplemented();
    return () => {};
  },
  getSnapshot: () => ({ currentCircle: null, messages: [] }),
  getServerSnapshot: () => ({ currentCircle: null, messages: [] })
});
