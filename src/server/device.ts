import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/server/prisma';
import { DEVICE_HEADER_NAME } from '@/lib/device';

export const resolveDeviceId = (request: NextRequest) => {
  const headerValue = request.headers.get(DEVICE_HEADER_NAME)?.trim();
  if (headerValue && headerValue.length >= 8) {
    return { id: headerValue, isNew: false };
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
