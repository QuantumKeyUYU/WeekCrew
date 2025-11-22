import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const isLiveBackendEnabled = Boolean(process.env.DATABASE_URL);

if (!isLiveBackendEnabled) {
  console.warn(
    'WeekCrew is running without DATABASE_URL (demo mode): messages stay local to the current device and are not shared.',
  );
}

const createPrismaClient = () => {
  const client = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
};

export const getPrismaClient = (): PrismaClient | null => {
  if (!isLiveBackendEnabled) {
    return null;
  }
  return createPrismaClient();
};

export const prisma = getPrismaClient();

export const ensurePrismaClient = (): PrismaClient => {
  const client = getPrismaClient();
  if (!client) {
    throw new Error('DATABASE_URL is not configured. Live backend is disabled.');
  }
  return client;
};
