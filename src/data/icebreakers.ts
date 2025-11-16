import { format } from 'date-fns';
import type { CopyKey } from '@/i18n/copy';

export interface IcebreakerDefinition {
  id: string;
  textKey: CopyKey;
}

export const ICEBREAKERS: IcebreakerDefinition[] = [
  { id: 'music-1', textKey: 'icebreaker_question_music' },
  { id: 'life-1', textKey: 'icebreaker_question_life' },
  { id: 'food-1', textKey: 'icebreaker_question_food' },
  { id: 'dream-1', textKey: 'icebreaker_question_dream' },
  { id: 'learn-1', textKey: 'icebreaker_question_learn' },
  { id: 'calm-1', textKey: 'icebreaker_question_calm' },
  { id: 'story-1', textKey: 'icebreaker_question_story' },
  { id: 'gratitude-1', textKey: 'icebreaker_question_gratitude' },
  { id: 'mood-1', textKey: 'icebreaker_question_mood' },
  { id: 'idea-1', textKey: 'icebreaker_question_idea' }
] as const;

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
};

export const getIcebreakerForCircle = (circleId: string, date: Date | string, seed?: string) => {
  const dayKey = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  const base = `${circleId}-${seed ?? ''}-${dayKey}`;
  const index = hashString(base) % ICEBREAKERS.length;
  return ICEBREAKERS[index];
};
