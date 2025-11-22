export type AppMode = 'demo' | 'live';

const resolveMode = (): AppMode => {
  const envValue = process.env.NEXT_PUBLIC_WEEKCREW_MODE;
  if (envValue === 'demo') {
    return 'demo';
  }
  return 'live';
};

const APP_MODE = resolveMode();

export const getAppMode = (): AppMode => APP_MODE;

export const isDemoMode = APP_MODE === 'demo';
