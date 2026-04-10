'use strict';

const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const AppError = require('../utils/AppError');
const { sendError } = require('../utils/response');
const env = require('../config/env');

/**
 * Global error handler middleware.
 * Must be registered as the LAST middleware in Express (4 arguments).
 *
 * Maps known error types to HTTP responses and hides internals in production.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // ── Zod validation error ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    // Zod 4 exposes `issues`; `errors` is undefined (Zod 3 had a getter — removed in v4).
    const issues = err.issues ?? [];
    const details = issues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : '',
      message: e.message,
    }));
    return sendError(res, {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Input validation failed',
      details,
    });
  }

  // ── Custom application error ──────────────────────────────────────────────
  if (err instanceof AppError) {
    return sendError(res, {
      status: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // ── Prisma known request errors ────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation — extract the conflicting field
        return sendError(res, {
          status: 409,
          code: 'CONFLICT',
          message: `A record with this ${err.meta?.target ?? 'field'} already exists`,
        });
      case 'P2025':
        return sendError(res, {
          status: 404,
          code: 'NOT_FOUND',
          message: 'Record not found',
        });
      default:
        return sendError(res, {
          status: 400,
          code: 'DATABASE_ERROR',
          message: env.NODE_ENV === 'production' ? 'Database error' : err.message,
        });
    }
  }

  // ── JWT errors ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, { status: 401, code: 'INVALID_TOKEN', message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, { status: 401, code: 'TOKEN_EXPIRED', message: 'Token has expired' });
  }

  // ── Fallback: unhandled error ──────────────────────────────────────────────
  if (env.NODE_ENV !== 'production') {
    console.error('[errorHandler]', err);
  }

  return sendError(res, {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
}

module.exports = errorHandler;
