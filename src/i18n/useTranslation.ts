'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { copy, type CopyKey, type Locale } from './copy';

type Replacements = Record<string, string | number>;

const formatCopy = (template: string, replacements?: Replacements) => {
  const safeTemplate = template ?? '';
  if (!replacements) {
    return safeTemplate;
  }
  return Object.entries(replacements).reduce((acc, [key, value]) => {
    const pattern = new RegExp(`\\{${key}\\}`, 'g');
    return acc.replace(pattern, String(value));
  }, safeTemplate);
};

const fallbackLocale: Locale = 'ru';

export const useTranslation = () => {
  const language = useAppStore((state) => state.settings.language ?? fallbackLocale);

  return useCallback(
    (key: CopyKey, replacements?: Replacements) => {
      const locale: Locale = language ?? fallbackLocale;
      const template = copy[locale][key] ?? copy[fallbackLocale][key] ?? key;
      return formatCopy(template, replacements);
    },
    [language]
  );
};
