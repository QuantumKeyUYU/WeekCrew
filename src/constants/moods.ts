export type MoodKey = 'calm' | 'support' | 'inspired' | 'hobby';

export const MOOD_OPTIONS: { key: MoodKey; labelKey: string; shortLabelKey: string }[] = [
  { key: 'calm', labelKey: 'explore_mood_chip_calm', shortLabelKey: 'mood_label_calm' },
  { key: 'support', labelKey: 'explore_mood_chip_support', shortLabelKey: 'mood_label_support' },
  { key: 'inspired', labelKey: 'explore_mood_chip_inspired', shortLabelKey: 'mood_label_inspired' },
  { key: 'hobby', labelKey: 'explore_mood_chip_hobby', shortLabelKey: 'mood_label_hobby' },
];
