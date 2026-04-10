'use strict';

/**
 * Custom application error class.
 * Services throw this to signal a known, expected failure with a specific
 * HTTP status code and error code that the global errorHandler maps to a response.
 */
class AppError extends Error {
  /**
   * @param {string} message   - Human-readable description
   * @param {number} statusCode
   * @param {string} code      - Machine-readable error code (e.g. 'NOT_FOUND')
   * @param {any}    [details] - Optional field-level validation details
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

module.exports = AppError;
