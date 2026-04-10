'use strict';

const prisma = require('../config/db');
const AppError = require('../utils/AppError');

// Known action constants — use these across services for consistency
const ACTIONS = {
  USER_REGISTERED: 'USER_REGISTERED',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CONTRACT_CREATED: 'CONTRACT_CREATED',
  CONTRACT_UPDATED: 'CONTRACT_UPDATED',
  CONTRACT_STATUS_CHANGED: 'CONTRACT_STATUS_CHANGED',
  CONTRACT_DELETED: 'CONTRACT_DELETED',
};

/**
 * Writes an audit log entry asynchronously (fire-and-forget).
 * Errors are caught and logged to stderr only — audit failures MUST NOT
 * propagate to the caller or affect the main response.
 *
 * @param {object} params
 * @param {string}  params.actorId
 * @param {string}  params.action         - One of ACTIONS.*
 * @param {string}  params.entityType     - e.g. 'contract', 'user', 'auth'
 * @param {string}  [params.entityId]
 * @param {string}  [params.contractId]
 * @param {object}  [params.diff]         - { before, after } for update events
 * @param {string}  [params.ipAddress]
 */
function logEvent(params) {
  // setImmediate defers DB write until after the current I/O event completes
  setImmediate(async () => {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId ?? null,
          contractId: params.contractId ?? null,
          diff: params.diff ?? null,
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch (err) {
      // Never throw — just log to stderr
      console.error('[audit] Failed to write audit log:', err.message);
    }
  });
}

/**
 * Returns the audit timeline for a specific contract.
 * Enforces ownership: non-admins can only see audit logs for their own contracts.
 *
 * @param {string} contractId
 * @param {object} caller  - { id, role }
 * @param {object} pagination - { page, limit }
 */
async function getContractAuditLog(contractId, caller, pagination = {}) {
  const { page = 1, limit = 50 } = pagination;

  // Verify contract exists and caller has access.
  // Use $queryRaw to bypass the soft-delete extension so audit logs are still
  // accessible for soft-deleted contracts (important for forensic review).
  const rows = await prisma.$queryRaw`
    SELECT id, created_by_id AS "createdById" FROM contracts WHERE id = ${contractId} LIMIT 1
  `;

  const contractRaw = rows?.[0];
  if (!contractRaw) throw new AppError('Contract not found', 404, 'NOT_FOUND');

  if (caller.role !== 'ADMIN' && contractRaw.createdById !== caller.id) {
    throw new AppError('You do not have permission to view this audit log', 403, 'FORBIDDEN');
  }

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        diff: true,
        ipAddress: true,
        createdAt: true,
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where: { contractId } }),
  ]);

  return { logs, total, page, limit };
}

module.exports = { logEvent, getContractAuditLog, ACTIONS };
