'use strict';

const AppError = require('../utils/AppError');

/**
 * Middleware factory — requires the caller to have one of the specified roles.
 * Must be used AFTER authenticate().
 *
 * @param {...string} roles - Allowed role values (e.g. 'ADMIN', 'USER')
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.delete('/:id', authenticate, requireRole('ADMIN'), controller.hardDelete);
 */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401, 'UNAUTHENTICATED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `This action requires one of the following roles: ${roles.join(', ')}`,
          403,
          'FORBIDDEN'
        )
      );
    }
    next();
  };
}

/**
 * Middleware — passes if the caller owns the resource OR has the ADMIN role.
 * The resource owner ID must be pre-loaded and attached to req.resourceOwnerId
 * by the preceding controller/service step.
 *
 * Usage pattern:
 *   1. Load the resource from DB in a small middleware or at the top of the controller.
 *   2. Set req.resourceOwnerId = resource.createdById
 *   3. Apply requireOwnerOrAdmin
 *
 * @example
 * router.put('/:id', authenticate, loadContract, requireOwnerOrAdmin, controller.update);
 */
function requireOwnerOrAdmin(req, _res, next) {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401, 'UNAUTHENTICATED'));
  }
  if (req.user.role === 'ADMIN' || req.user.id === req.resourceOwnerId) {
    return next();
  }
  return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
}

module.exports = { requireRole, requireOwnerOrAdmin };
