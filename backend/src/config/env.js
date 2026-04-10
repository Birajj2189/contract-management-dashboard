'use strict';

const { z } = require('zod');

/**
 * Validates all required environment variables at startup.
 * The app will crash fast with a clear error if anything is missing or malformed.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().url('CORS_ORIGIN must be a valid URL').default('http://localhost:5173'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  // Rate limiting — auth endpoints
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  const formatted = _parsed.error.errors
    .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
    .join('\n');
  console.error(`\n[env] Invalid environment variables:\n${formatted}\n`);
  process.exit(1);
}

module.exports = _parsed.data;
