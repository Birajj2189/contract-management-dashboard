'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const env = require('../config/env');
const {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { logEvent, ACTIONS } = require('./audit.service');

// ─────────────────────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new user account with the USER role.
 * @param {{ name: string, email: string, password: string }} dto
 * @returns {{ user: object, accessToken: string, rawRefreshToken: string }}
 */
async function register(dto) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) {
    throw new AppError('An account with this email already exists', 409, 'CONFLICT');
  }

  const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: { name: dto.name, email: dto.email, passwordHash },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const { accessToken, rawRefreshToken } = await _issueTokens(user.id);

  logEvent({
    actorId: user.id,
    action: ACTIONS.USER_REGISTERED,
    entityType: 'user',
    entityId: user.id,
  });

  return { user, accessToken, rawRefreshToken };
}

// ─────────────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates credentials and returns tokens.
 * Uses a constant-time comparison to prevent timing attacks.
 * @param {{ email: string, password: string }} dto
 * @param {string} ipAddress
 * @returns {{ user: object, accessToken: string, rawRefreshToken: string }}
 */
async function login(dto, ipAddress) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });

  // Always run bcrypt even on missing user to avoid timing-based enumeration
  const dummyHash = '$2a$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const isValid = await bcrypt.compare(dto.password, user?.passwordHash ?? dummyHash);

  if (!user || !isValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  const { accessToken, rawRefreshToken } = await _issueTokens(user.id);

  logEvent({
    actorId: user.id,
    action: ACTIONS.LOGIN,
    entityType: 'auth',
    entityId: user.id,
    ipAddress,
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    rawRefreshToken,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Refresh (token rotation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rotates the refresh token:
 *  1. Validates the incoming raw token against the DB hash.
 *  2. Detects reuse (revoked token used again) → revokes entire token family.
 *  3. Revokes the old token, issues a new access + refresh token pair.
 *
 * @param {string} rawToken - Value from the HttpOnly cookie
 * @returns {{ accessToken: string, rawRefreshToken: string }}
 */
async function refreshTokens(rawToken) {
  if (!rawToken) {
    throw new AppError('Refresh token missing', 401, 'UNAUTHENTICATED');
  }

  const hashed = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { token: hashed } });

  if (!stored) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
  }

  // ── Reuse detection: token family invalidation ──────────────────────────
  if (stored.revokedAt !== null) {
    // A revoked token was presented — invalidate the entire family
    await _revokeTokenFamily(stored.token);
    throw new AppError(
      'Refresh token reuse detected — all sessions have been invalidated',
      401,
      'TOKEN_REUSE_DETECTED'
    );
  }

  if (stored.expiresAt < new Date()) {
    throw new AppError('Refresh token has expired', 401, 'TOKEN_EXPIRED');
  }

  // ── Issue new token pair ────────────────────────────────────────────────
  const { accessToken, rawRefreshToken: newRawToken, hashed: newHashed } = await _buildTokens();

  await prisma.$transaction([
    // Revoke the old token, link it to its replacement
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedByToken: newHashed },
    }),
    // Store the new token
    prisma.refreshToken.create({
      data: {
        token: newHashed,
        userId: stored.userId,
        expiresAt: getRefreshTokenExpiry(),
      },
    }),
  ]);

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) {
    throw new AppError('User not found or deactivated', 401, 'UNAUTHENTICATED');
  }

  return {
    accessToken: signAccessToken({ id: user.id, role: user.role }),
    rawRefreshToken: newRawToken,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Revokes the refresh token cookie, ending the session.
 * @param {string} rawToken - Value from the HttpOnly cookie
 */
async function logout(rawToken) {
  if (!rawToken) return; // Idempotent — already logged out
  const hashed = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { token: hashed },
    select: { userId: true },
  });

  await prisma.refreshToken.updateMany({
    where: { token: hashed, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  if (stored?.userId) {
    logEvent({
      actorId: stored.userId,
      action: ACTIONS.LOGOUT,
      entityType: 'auth',
      entityId: stored.userId,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get current user
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the authenticated user's profile.
 * @param {string} userId
 * @returns {object}
 */
async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function _issueTokens(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  const { accessToken, rawRefreshToken, hashed } = _buildTokens();

  await prisma.refreshToken.create({
    data: {
      token: hashed,
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken: signAccessToken({ id: user.id, role: user.role }), rawRefreshToken };
}

function _buildTokens() {
  const { raw, hashed } = generateRefreshToken();
  return { rawRefreshToken: raw, hashed, accessToken: null };
}

/**
 * Revokes all non-revoked tokens in a rotation chain (family invalidation).
 * Called when a token that was already revoked is presented (reuse detection).
 * Traces the chain forward via replacedByToken to find active descendants.
 *
 * Simplified approach: revoke all active tokens for the family's user.
 * @param {string} rootTokenHash
 */
async function _revokeTokenFamily(rootTokenHash) {
  const root = await prisma.refreshToken.findUnique({ where: { token: rootTokenHash } });
  if (!root) return;
  // Revoke all active tokens for this user (nuclear option for family invalidation)
  await prisma.refreshToken.updateMany({
    where: { userId: root.userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = { register, login, refreshTokens, logout, getMe };
