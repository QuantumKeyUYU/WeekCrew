'use client';

import { useEffect, useState } from 'react';

import type { Timestamp } from 'firebase/firestore';

interface CountdownState {
  formatted: string;
  isExpired: boolean;
}

type CountdownTarget = Timestamp | string | Date | null | undefined;

const resolveTargetDate = (target: CountdownTarget): Date | null => {
  if (!target) {
    return null;
  }
  if (target instanceof Date) {
    return target;
  }
  if (typeof (target as Timestamp)?.toDate === 'function') {
    return (target as Timestamp).toDate();
  }
  if (typeof target === 'string') {
    const parsed = Date.parse(target);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }
  return null;
};

export const useCountdown = (target?: CountdownTarget) => {
  const [state, setState] = useState<CountdownState>({ formatted: '7 дней', isExpired: false });

  useEffect(() => {
    const targetDate = resolveTargetDate(target);
    if (!targetDate) {
      setState({ formatted: '7 дней', isExpired: false });
      return;
    }

    const update = () => {
      const targetTime = targetDate.getTime();
      if (Number.isNaN(targetTime)) {
        setState({ formatted: '—', isExpired: false });
        return;
      }
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setState({ formatted: 'Неделя завершена', isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setState({ formatted: `${days}д ${hours}ч ${minutes}м`, isExpired: false });
    };

    update();
    const interval = window.setInterval(update, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  return state;
};
