'use strict';

const auditService = require('../services/audit.service');
const { sendSuccess } = require('../utils/response');
const { buildPaginationMeta } = require('../utils/pagination');

// GET /api/contracts/:id/audit
async function getContractAudit(req, res, next) {
  try {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = Math.min(parseInt(req.query.limit ?? '50', 10), 100);

    const { logs, total } = await auditService.getContractAuditLog(
      req.params.id,
      req.user,
      { page, limit }
    );

    sendSuccess(res, {
      data: { logs },
      meta: buildPaginationMeta({ total, page, limit }),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getContractAudit };
