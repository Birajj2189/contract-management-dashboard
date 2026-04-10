'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

/**
 * Extracts and verifies the Bearer access token from the Authorization header.
 * On success, attaches { id, role } to req.user and calls next().
 * On failure, throws 401 AppError.
 */
function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Bearer ')) {
      throw new AppError('Authorization header missing or malformed', 401, 'UNAUTHENTICATED');
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    // Re-throw AppError as-is; let JWT errors propagate to errorHandler
    next(err);
  }
}

module.exports = authenticate;
