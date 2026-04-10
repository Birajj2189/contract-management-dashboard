'use strict';

const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

/**
 * Prisma 7 requires an explicit database adapter.
 * We use @prisma/adapter-pg which wraps the `pg` connection pool.
 *
 * DATABASE_URL is loaded from .env via dotenv in src/index.js before
 * this module is ever require()'d.
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const baseClient = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
});

/**
 * Soft-delete extension — automatically injects `deletedAt: null` into
 * Contract queries so deleted records are never accidentally returned.
 *
 * Uses Prisma Client Extensions ($extends) — the Prisma 7 replacement for $use middleware.
 *
 * Coverage: findMany, findFirst, count
 * Note: findUnique is not intercepted here; all contract lookups by ID should
 * use findFirst({ where: { id, deletedAt: null } }) explicitly in services.
 */
const prisma = baseClient.$extends({
  query: {
    contract: {
      async findMany({ args, query }) {
        args.where ??= {};
        if (args.where.deletedAt === undefined) args.where.deletedAt = null;
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where ??= {};
        if (args.where.deletedAt === undefined) args.where.deletedAt = null;
        return query(args);
      },
      async count({ args, query }) {
        args.where ??= {};
        if (args.where.deletedAt === undefined) args.where.deletedAt = null;
        return query(args);
      },
    },
  },
});

/**
 * Singleton — store on globalThis so nodemon hot-reloads don't open
 * a new pool on every file change in development.
 */
const globalForPrisma = globalThis;
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma._prismaClient = prisma;
}

module.exports = prisma;
