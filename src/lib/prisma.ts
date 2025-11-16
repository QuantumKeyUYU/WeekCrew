// @ts-ignore -- prisma client types are generated at build time
import { PrismaClient } from '@prisma/client';

type GlobalWithPrisma = typeof global & {
  prisma?: PrismaClient;
};

const globalForPrisma = global as GlobalWithPrisma;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
