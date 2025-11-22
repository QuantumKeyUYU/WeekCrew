import type { MoodKey } from '@/constants/moods';
import type { InterestId } from '@/types';

const STORAGE_KEY = 'weekcrew:last-circle-selection';

export interface CircleSelection {
  mood: MoodKey;
  interestId: InterestId;
}

export const saveCircleSelection = (selection: CircleSelection) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch (error) {
    console.warn('Failed to persist circle selection', error);
  }
};

export const loadCircleSelection = (): CircleSelection | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CircleSelection;
    if (parsed && typeof parsed === 'object' && parsed.mood && parsed.interestId) {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to read circle selection', error);
  }
  return null;
};

export const clearCircleSelection = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear circle selection', error);
  }
};
