'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

/**
 * Signs a short-lived access token containing the user's id and role.
 * @param {{ id: string, role: string }} payload
 * @returns {string} Signed JWT
 */
function signAccessToken(payload) {
  return jwt.sign(
    { sub: payload.id, role: payload.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
}

/**
 * Signs a long-lived refresh token (opaque random string, not a JWT).
 * The raw value is stored in the HttpOnly cookie; a SHA-256 hash is stored in DB.
 * @returns {{ raw: string, hashed: string }}
 */
function generateRefreshToken() {
  const raw = crypto.randomBytes(64).toString('hex');
  const hashed = hashToken(raw);
  return { raw, hashed };
}

/**
 * SHA-256 hashes a token string.
 * Used to safely store refresh tokens without exposing the raw value.
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verifies an access token and returns the decoded payload.
 * Throws JsonWebTokenError or TokenExpiredError on failure — caught by errorHandler.
 * @param {string} token
 * @returns {{ sub: string, role: string, iat: number, exp: number }}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

/**
 * Calculates the expiry Date for a refresh token based on JWT_REFRESH_EXPIRES_IN.
 * Parses simple duration strings: "7d", "30d", "24h", "60m".
 * @returns {Date}
 */
function getRefreshTokenExpiry() {
  const raw = env.JWT_REFRESH_EXPIRES_IN;
  const match = raw.match(/^(\d+)([dhm])$/);
  if (!match) throw new Error(`Invalid JWT_REFRESH_EXPIRES_IN format: ${raw}`);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const ms =
    unit === 'd' ? value * 24 * 60 * 60 * 1000
    : unit === 'h' ? value * 60 * 60 * 1000
    : value * 60 * 1000;
  return new Date(Date.now() + ms);
}

module.exports = { signAccessToken, generateRefreshToken, hashToken, verifyAccessToken, getRefreshTokenExpiry };
