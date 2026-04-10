'use strict';

const { z } = require('zod');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parses and validates the page/limit query parameters from the request.
 *
 * @param {object} query - req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePaginationQuery(query) {
  const schema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(MAX_LIMIT, `limit cannot exceed ${MAX_LIMIT}`)
      .default(DEFAULT_LIMIT),
  });

  const { page, limit } = schema.parse(query);
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Builds the meta object to attach to paginated responses.
 *
 * @param {object} options
 * @param {number} options.total  - Total matching record count
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {{ total: number, page: number, limit: number, totalPages: number, hasNextPage: boolean }}
 */
function buildPaginationMeta({ total, page, limit }) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
  };
}

module.exports = { parsePaginationQuery, buildPaginationMeta };
