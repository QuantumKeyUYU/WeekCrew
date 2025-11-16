import type { CopyKey } from '@/i18n/copy';
import type { InterestTag } from '@/types';

export interface InterestDefinition {
  id: InterestTag;
  labelKey: CopyKey;
  descriptionKey: CopyKey;
}

export const INTERESTS: InterestDefinition[] = [
  { id: 'kpop', labelKey: 'interest_kpop_label', descriptionKey: 'interest_kpop_description' },
  { id: 'anime', labelKey: 'interest_anime_label', descriptionKey: 'interest_anime_description' },
  { id: 'drama', labelKey: 'interest_drama_label', descriptionKey: 'interest_drama_description' },
  { id: 'psychology', labelKey: 'interest_psychology_label', descriptionKey: 'interest_psychology_description' },
  { id: 'books', labelKey: 'interest_books_label', descriptionKey: 'interest_books_description' },
  { id: 'music', labelKey: 'interest_music_label', descriptionKey: 'interest_music_description' },
  { id: 'it', labelKey: 'interest_it_label', descriptionKey: 'interest_it_description' },
  { id: 'games', labelKey: 'interest_games_label', descriptionKey: 'interest_games_description' },
  { id: 'movies', labelKey: 'interest_movies_label', descriptionKey: 'interest_movies_description' },
  { id: 'custom', labelKey: 'interest_custom_label', descriptionKey: 'interest_custom_description' }
];
