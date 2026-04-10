'use strict';

/**
 * Validation middleware factory.
 * Wraps a Zod schema and validates the specified part of the request.
 * On success it replaces req[target] with the parsed (coerced + stripped) data.
 * On failure it throws a ZodError which the global errorHandler maps to 400.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [target='body']
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/contracts', validate(createContractSchema), controller.create);
 */
function validate(schema, target = 'body') {
  return (req, _res, next) => {
    try {
      req[target] = schema.parse(req[target]);
      next();
    } catch (err) {
      next(err); // ZodError → errorHandler → 400
    }
  };
}

module.exports = validate;
