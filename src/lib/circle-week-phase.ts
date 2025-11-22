export type CircleWeekPhase = 'start' | 'middle' | 'final';

export interface CircleWeekPhaseParams {
  createdAt: Date;
  expiresAt: Date;
  now?: Date;
}

export function getCircleWeekPhase({ createdAt, expiresAt, now }: CircleWeekPhaseParams): CircleWeekPhase {
  const effectiveNow = now ?? new Date();
  const totalMs = Math.max(expiresAt.getTime() - createdAt.getTime(), 1);
  const elapsedMs = effectiveNow.getTime() - createdAt.getTime();
  const clampedRatio = Math.max(0, Math.min(1, elapsedMs / totalMs));

  if (clampedRatio <= 1 / 3) {
    return 'start';
  }
  if (clampedRatio <= 2 / 3) {
    return 'middle';
  }
  return 'final';
}
