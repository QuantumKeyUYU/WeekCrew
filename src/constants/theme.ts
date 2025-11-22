import type { AppSettings } from '@/types';

export type ThemePreference = AppSettings['theme'];

export const THEME_STORAGE_KEY = 'weekcrew-theme';

export const resolveThemePreference = (theme: ThemePreference): 'light' | 'dark' => {
  if (theme === 'light' || theme === 'dark') {
    return theme;
  }
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const persistThemePreference = (theme: ThemePreference) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to persist theme preference', error);
  }
};

export const applyThemePreference = (theme: ThemePreference) => {
  if (typeof document === 'undefined') {
    return;
  }
  const resolved = resolveThemePreference(theme);
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.theme = resolved;
  root.dataset.themeMode = theme;
  if (document.body) {
    document.body.dataset.theme = resolved;
  }
};
