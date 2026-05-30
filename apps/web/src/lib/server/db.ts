import { PrismaClient } from '@prisma/client';

import { getPooledDatabaseUrl } from './database-url';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getPooledDatabaseUrl() },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse one client across hot reloads in `next dev`
globalForPrisma.prisma = prisma;
