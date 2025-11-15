'use client';

import { useEffect, useState } from 'react';

interface CountdownState {
  formatted: string;
  isExpired: boolean;
}

export const useCountdown = (targetIso?: string | null) => {
  const [state, setState] = useState<CountdownState>({ formatted: '7 дней', isExpired: false });

  useEffect(() => {
    if (!targetIso) {
      setState({ formatted: '7 дней', isExpired: false });
      return;
    }

    const update = () => {
      const target = new Date(targetIso).getTime();
      const now = Date.now();
      const diff = target - now;

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
  }, [targetIso]);

  return state;
};
