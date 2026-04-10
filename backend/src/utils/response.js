'use strict';

/**
 * Sends a successful JSON response with a consistent envelope.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {any}    options.data        - Response payload
 * @param {number} [options.status=200]
 * @param {object} [options.meta]      - Pagination or extra metadata
 */
function sendSuccess(res, { data, status = 200, meta } = {}) {
  const body = { success: true, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(status).json(body);
}

/**
 * Sends an error JSON response with a consistent envelope.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.status=500]
 * @param {string} [options.code='INTERNAL_SERVER_ERROR']
 * @param {string} [options.message]
 * @param {any}    [options.details]   - Field-level validation errors etc.
 */
function sendError(res, { status = 500, code = 'INTERNAL_SERVER_ERROR', message, details } = {}) {
  const error = { code, message: message ?? code };
  if (details !== undefined) error.details = details;
  return res.status(status).json({ success: false, error });
}

module.exports = { sendSuccess, sendError };
