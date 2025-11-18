'use client';

import { useCallback, useEffect, useState } from 'react';

export const SAFETY_RULES_KEY = 'weekcrew:safety-accepted-v2';

export const useSafetyRules = () => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(SAFETY_RULES_KEY);
      setAccepted(stored === '1');
    } catch {
      setAccepted(false);
    }
  }, []);

  const markAccepted = useCallback(() => {
    setAccepted(true);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SAFETY_RULES_KEY, '1');
    } catch {
      // ignore
    }
  }, []);

  const resetAccepted = useCallback(() => {
    setAccepted(false);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(SAFETY_RULES_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { accepted, markAccepted, resetAccepted };
};
