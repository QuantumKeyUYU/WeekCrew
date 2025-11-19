import type { Circle } from '@prisma/client';

export const CIRCLE_TTL_DAYS = 7;
const MS_IN_HOUR = 60 * 60 * 1000;

const parseTtlOverride = () => {
  const raw = process.env.WEEKCREW_CIRCLE_TTL_HOURS;
  if (!raw) {
    return null;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
};

const getCircleTtlHours = () => {
  const overrideHours = parseTtlOverride();
  if (overrideHours) {
    return overrideHours;
  }
  return CIRCLE_TTL_DAYS * 24;
};

export function computeCircleExpiry(createdAt: Date = new Date()): Date {
  return new Date(createdAt.getTime() + getCircleTtlHours() * MS_IN_HOUR);
}

export function isCircleActive(circle: Pick<Circle, 'status' | 'expiresAt'>, now = new Date()): boolean {
  return circle.status === 'active' && circle.expiresAt > now;
}

export function getCircleRemainingMs(circle: Pick<Circle, 'expiresAt'>, now = new Date()): number {
  return Math.max(circle.expiresAt.getTime() - now.getTime(), 0);
}
