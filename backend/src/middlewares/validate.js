'use strict';

/**
 * Validation middleware factory.
 * Wraps a Zod schema and validates the specified part of the request.
 * On success it attaches the parsed (coerced + stripped) data as req.validated[target]
 * and also attempts to merge it back to req[target] where writable.
 * On failure it throws a ZodError which the global errorHandler maps to 400.
 *
 * Note: In Express 5, req.query is a getter-only property, so we store parsed
 * query params in req.validatedQuery instead of overwriting req.query.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [target='body']
 * @returns {import('express').RequestHandler}
 */
function validate(schema, target = 'body') {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[target]);

      if (target === 'query') {
        // Express 5: req.query is read-only; store parsed result separately
        req.validatedQuery = parsed;
      } else {
        req[target] = parsed;
      }

      next();
    } catch (err) {
      next(err); // ZodError → errorHandler → 400
    }
  };
}

module.exports = validate;
