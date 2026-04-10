'use strict';

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

const REFRESH_COOKIE_NAME = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth', // Scoped so the cookie is only sent to auth endpoints
};

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { user, accessToken, rawRefreshToken } = await authService.register(req.body);

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, {
      ...cookieOptions,
      maxAge: _parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'),
    });

    sendSuccess(res, {
      data: { user, accessToken },
      status: 201,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const ipAddress = req.ip ?? req.headers['x-forwarded-for'];
    const { user, accessToken, rawRefreshToken } = await authService.login(req.body, ipAddress);

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, {
      ...cookieOptions,
      maxAge: _parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'),
    });

    sendSuccess(res, { data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────
async function refresh(req, res, next) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const { accessToken, rawRefreshToken } = await authService.refreshTokens(rawToken);

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, {
      ...cookieOptions,
      maxAge: _parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'),
    });

    sendSuccess(res, { data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
async function logout(req, res, next) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(rawToken);

    res.clearCookie(REFRESH_COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
    sendSuccess(res, { data: null });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, { data: { user } });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────
function _parseDurationMs(str) {
  const match = str.match(/^(\d+)([dhm])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const v = parseInt(match[1], 10);
  const u = match[2];
  return u === 'd' ? v * 86400000 : u === 'h' ? v * 3600000 : v * 60000;
}

module.exports = { register, login, refresh, logout, me };
