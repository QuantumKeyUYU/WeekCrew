import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

export const isLiveBackendEnabled = Boolean(process.env.DATABASE_URL);

if (!isLiveBackendEnabled) {
  console.warn(
    'WeekCrew is running without DATABASE_URL (demo mode): messages stay local to the current device and are not shared.',
  );
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
