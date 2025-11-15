'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { INTERESTS } from '@/constants/interests';
import type { InterestTag } from '@/types';
import { fetchActiveCircleByInterest, createCircle, joinCircle } from '@/lib/circles';
import { useAppStore } from '@/store/useAppStore';

export default function ExplorePage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const updateUser = useAppStore((state) => state.updateUser);
  const setCircle = useAppStore((state) => state.setCircle);
  const [selected, setSelected] = useState<InterestTag | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSelect = async (interest: InterestTag) => {
    setSelected(interest);
    setStatus('loading');
    setError('');

    try {
      let circle = await fetchActiveCircleByInterest(interest);
      if (!circle) {
        circle = await createCircle(interest);
      }
      if (!user) {
        throw new Error('Нужен анонимный профиль');
      }
      await joinCircle(circle, user.id);
      const joinedCircle = { ...circle, participantCount: circle.participantCount + 1 };
      setCircle(joinedCircle);
      updateUser((prev) => {
        if (!prev) {
          return null;
        }
        const interests = Array.from(new Set([...(prev.interests ?? []), interest]));
        return {
          ...prev,
          interests,
          currentCircleId: joinedCircle.id
        };
      });
      setStatus('success');
      router.push('/circle');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err?.message || 'Не получилось подключиться к кружку. Попробуй ещё раз.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-brand-foreground">Выбор интереса</h1>
        <p className="mt-2 text-sm text-slate-300">
          Каждый кружок — новая компания. Выбери интерес и система найдет активный круг или создаст
          свежий за пару секунд.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTERESTS.map((interest) => (
          <button
            key={interest.id}
            onClick={() => handleSelect(interest.id)}
            className={clsx(
              'rounded-3xl border px-5 py-4 text-left transition-transform hover:-translate-y-1',
              selected === interest.id ? 'border-brand bg-brand/10' : 'border-white/10 bg-slate-950/50'
            )}
          >
            <div className="text-sm font-semibold text-brand-foreground">{interest.label}</div>
            <p className="mt-1 text-xs text-slate-300">{interest.description}</p>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
        {status === 'idle' && <p>Нажми на карточку интереса, чтобы подобрать кружок.</p>}
        {status === 'loading' && (
          <p>
            Подбираем кружок для тебя... <span className="animate-pulse">⏳</span>
          </p>
        )}
        {status === 'success' && (
          <p className="text-brand-foreground">
            Готово! Отправляем тебя в кружок недели. Если страница не открылась автоматически,
            перейди на вкладку «Мой кружок».
          </p>
        )}
        {status === 'error' && <p className="text-red-300">{error}</p>}
      </div>
    </div>
  );
}
