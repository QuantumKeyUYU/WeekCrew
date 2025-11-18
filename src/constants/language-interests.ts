import type { CopyKey } from '@/i18n/copy';
import type { InterestId } from '@/lib/weekcrewStorage';

export interface LanguageInterestConfig {
  id: InterestId;
  icon: string;
  labelKey: CopyKey;
}

export const LANGUAGE_INTERESTS: LanguageInterestConfig[] = [
  { id: 'lang_english', icon: '🇬🇧', labelKey: 'interest_lang_english' },
  { id: 'lang_korean', icon: '🇰🇷', labelKey: 'interest_lang_korean' },
  { id: 'lang_japanese', icon: '🇯🇵', labelKey: 'interest_lang_japanese' },
  { id: 'lang_tatar', icon: '🐾', labelKey: 'interest_lang_tatar' },
  { id: 'lang_german', icon: '🇩🇪', labelKey: 'interest_lang_german' },
  { id: 'lang_turkish', icon: '🇹🇷', labelKey: 'interest_lang_turkish' },
  { id: 'lang_other', icon: '🌍', labelKey: 'interest_lang_other' },
];
