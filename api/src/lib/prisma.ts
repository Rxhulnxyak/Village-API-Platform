/**
 * Prisma Client Singleton
 *
 * WHY SINGLETON IN SERVERLESS:
 * Each Vercel function invocation creates a new Node.js module environment.
 * Without singleton pattern: each request creates a new Prisma client and
 * new PostgreSQL connections, exhausting NeonDB's connection limit (~100) instantly.
 *
 * Pattern: Store on globalThis — survives hot module replacement in development.
 * In production: each serverless instance gets one client, pooled via pgBouncer.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Slow query logging: queries >500ms logged in development to identify N+1 problems
const PROD_DB = "postgresql://neondb_owner:npg_2FBmEL5ahXPW@ep-proud-violet-anpv4637-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || PROD_DB
      }
    },
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    if (e.duration > 500) {
      console.warn(`[SLOW QUERY] ${e.query} - ${e.duration}ms`);
    }
  });
}
