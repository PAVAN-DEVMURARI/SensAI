import { PrismaClient } from '@prisma/client';

// Reuse the PrismaClient instance across hot-reloads in development
// to avoid exhausting database connections.
const globalForPrisma = globalThis;

export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;