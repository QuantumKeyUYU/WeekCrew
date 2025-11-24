import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { DEVICE_HEADER_NAME } from '@/lib/device';

const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{12,}$/;

const readRawDeviceId = (request: NextRequest) =>
  request.headers.get(DEVICE_HEADER_NAME)?.trim() ||
  request.cookies.get('deviceId')?.value?.trim() ||
  null;

export const resolveDeviceId = (request: NextRequest) => {
  const raw = readRawDeviceId(request);
  if (raw && DEVICE_ID_PATTERN.test(raw)) {
    return { id: raw, isNew: false };
  }
  return { id: randomUUID(), isNew: true };
};

export const getOrCreateDevice = async (request: NextRequest) => {
  const { id, isNew } = resolveDeviceId(request);
  const device = await prisma.device.upsert({
    where: { id },
    create: { id },
    update: {},
  });
  return { device, id, isNew };
};
