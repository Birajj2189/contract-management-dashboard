'use strict';

const prisma = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * Lists all version snapshots for a contract in descending order (newest first).
 * Enforces ownership for non-admins by checking the parent contract.
 *
 * @param {string} contractId
 * @param {object} caller  - { id, role }
 */
async function listVersions(contractId, caller) {
  // Verify the contract exists and caller has access
  const contract = await prisma.contract.findFirst({ where: { id: contractId } });
  if (!contract) throw new AppError('Contract not found', 404, 'NOT_FOUND');
  _assertAccess(contract, caller);

  const versions = await prisma.contractVersion.findMany({
    where: { contractId },
    orderBy: { versionNumber: 'desc' },
    select: {
      id: true,
      versionNumber: true,
      createdAt: true,
      changedBy: { select: { id: true, name: true, email: true } },
      // Snapshot is large — omit from list, only include in getVersion
    },
  });

  return versions;
}

/**
 * Returns the full snapshot of a specific version.
 *
 * @param {string} contractId
 * @param {string} versionId
 * @param {object} caller  - { id, role }
 */
async function getVersion(contractId, versionId, caller) {
  const contract = await prisma.contract.findFirst({ where: { id: contractId } });
  if (!contract) throw new AppError('Contract not found', 404, 'NOT_FOUND');
  _assertAccess(contract, caller);

  const version = await prisma.contractVersion.findFirst({
    where: { id: versionId, contractId },
    include: { changedBy: { select: { id: true, name: true, email: true } } },
  });

  if (!version) throw new AppError('Version not found', 404, 'NOT_FOUND');

  return version;
}

/**
 * Returns two consecutive version snapshots as a basic diff.
 * Compares scalar fields only (title, description, status, startDate, endDate)
 * and party membership (added/removed by name).
 *
 * @param {string} contractId
 * @param {string} fromVersionId
 * @param {string} toVersionId
 * @param {object} caller
 */
async function diffVersions(contractId, fromVersionId, toVersionId, caller) {
  const [fromVer, toVer] = await Promise.all([
    getVersion(contractId, fromVersionId, caller),
    getVersion(contractId, toVersionId, caller),
  ]);

  const SCALAR_FIELDS = ['title', 'description', 'status', 'startDate', 'endDate'];
  const changes = {};

  for (const field of SCALAR_FIELDS) {
    const before = fromVer.snapshot[field];
    const after = toVer.snapshot[field];
    if (String(before) !== String(after)) {
      changes[field] = { before, after };
    }
  }

  // Party diff
  const fromParties = new Set((fromVer.snapshot.parties ?? []).map((p) => p.name));
  const toParties = new Set((toVer.snapshot.parties ?? []).map((p) => p.name));

  const addedParties = [...toParties].filter((n) => !fromParties.has(n));
  const removedParties = [...fromParties].filter((n) => !toParties.has(n));

  if (addedParties.length || removedParties.length) {
    changes.parties = { added: addedParties, removed: removedParties };
  }

  return { from: fromVer, to: toVer, changes };
}

function _assertAccess(contract, caller) {
  if (caller.role !== 'ADMIN' && contract.createdById !== caller.id) {
    throw new AppError('You do not have permission to access this contract', 403, 'FORBIDDEN');
  }
}

module.exports = { listVersions, getVersion, diffVersions };
