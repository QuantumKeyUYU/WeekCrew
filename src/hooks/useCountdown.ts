'use client';

import { useEffect, useState } from 'react';

export const useCountdown = (targetIso?: string | null) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!targetIso) {
      setTimeLeft('7 дней');
      return;
    }

    const update = () => {
      const target = new Date(targetIso).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Неделя завершена');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${days}д ${hours}ч ${minutes}м`);
    };

    update();
    const interval = window.setInterval(update, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [targetIso]);

  return timeLeft;
};
