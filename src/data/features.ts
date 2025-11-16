import type { CopyKey } from '@/i18n/copy';

export interface FeatureDefinition {
  titleKey: CopyKey;
  descriptionKey: CopyKey;
}

export const FEATURES: FeatureDefinition[] = [
  { titleKey: 'feature_week_length_title', descriptionKey: 'feature_week_length_description' },
  { titleKey: 'feature_small_group_title', descriptionKey: 'feature_small_group_description' },
  { titleKey: 'feature_daily_icebreaker_title', descriptionKey: 'feature_daily_icebreaker_description' },
  { titleKey: 'feature_no_likes_title', descriptionKey: 'feature_no_likes_description' }
];
