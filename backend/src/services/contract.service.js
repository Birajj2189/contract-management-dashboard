'use strict';

const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { buildPaginationMeta } = require('../utils/pagination');
const { logEvent, ACTIONS } = require('./audit.service');

// ─────────────────────────────────────────────────────────────────────────────
// Status transition map
// Admin can bypass; regular users follow these rules.
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_TRANSITIONS = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['EXECUTED', 'EXPIRED'],
  EXECUTED: [],
  EXPIRED: [],
};

// Standard include block: parties only (versions/audit are fetched separately)
const CONTRACT_INCLUDE = {
  parties: { select: { id: true, name: true, email: true, role: true } },
  createdBy: { select: { id: true, name: true, email: true } },
};

// ─────────────────────────────────────────────────────────────────────────────
// List
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists contracts with search, filter, sort, and pagination.
 * Admins see all contracts; regular users see only their own.
 *
 * @param {object} query   - Validated query params from listContractsQuerySchema
 * @param {object} caller  - { id, role }
 */
async function listContracts(query, caller) {
  const { search, status, startDateFrom, startDateTo, sortBy, sortOrder, page, limit } = query;
  const skip = (page - 1) * limit;

  // Base filter — RBAC: users see only their contracts
  const where = {};
  if (caller.role !== 'ADMIN') {
    where.createdById = caller.id;
  }

  // Search: title ILIKE or parties.name ILIKE
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { parties: { some: { name: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  // Status filter
  if (status?.length) {
    where.status = { in: status };
  }

  // Date range filter (on startDate)
  if (startDateFrom || startDateTo) {
    where.startDate = {};
    if (startDateFrom) where.startDate.gte = startDateFrom;
    if (startDateTo) where.startDate.lte = startDateTo;
  }

  const [contracts, total] = await prisma.$transaction([
    prisma.contract.findMany({
      where,
      include: CONTRACT_INCLUDE,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.contract.count({ where }),
  ]);

  return {
    contracts,
    meta: buildPaginationMeta({ total, page, limit }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get one
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a single contract. Enforces ownership check for non-admins.
 * @param {string} contractId
 * @param {object} caller  - { id, role }
 */
async function getContract(contractId, caller) {
  const contract = await prisma.contract.findFirst({
    where: { id: contractId },
    include: CONTRACT_INCLUDE,
  });

  if (!contract) throw new AppError('Contract not found', 404, 'NOT_FOUND');

  _assertOwnerOrAdmin(contract, caller);
  return contract;
}

// ─────────────────────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a contract with its parties inside a transaction.
 * Also creates the initial version snapshot (v1).
 *
 * @param {object} dto     - Validated body from createContractSchema
 * @param {object} caller  - { id, role }
 */
async function createContract(dto, caller) {
  const { parties, ...contractData } = dto;

  if (caller.role !== 'ADMIN') {
    const allowedCreate = ['DRAFT', 'ACTIVE'];
    if (!allowedCreate.includes(contractData.status)) {
      throw new AppError(
        'When creating a contract you may only set status to DRAFT or ACTIVE.',
        422,
        'INVALID_STATUS'
      );
    }
  }

  const contract = await prisma.$transaction(async (tx) => {
    const created = await tx.contract.create({
      data: {
        ...contractData,
        createdById: caller.id,
        parties: {
          create: parties,
        },
      },
      include: CONTRACT_INCLUDE,
    });

    // Create initial version snapshot (v1)
    await tx.contractVersion.create({
      data: {
        contractId: created.id,
        versionNumber: 1,
        snapshot: _buildSnapshot(created),
        changedById: caller.id,
      },
    });

    return created;
  });

  logEvent({
    actorId: caller.id,
    action: ACTIONS.CONTRACT_CREATED,
    entityType: 'contract',
    entityId: contract.id,
    contractId: contract.id,
    diff: null,
  });

  return contract;
}

// ─────────────────────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates a contract, validates status transitions, and creates a version snapshot.
 * Parties are replaced atomically if provided (delete-and-recreate pattern).
 *
 * @param {string} contractId
 * @param {object} dto     - Validated body from updateContractSchema
 * @param {object} caller  - { id, role }
 */
async function updateContract(contractId, dto, caller) {
  const existing = await prisma.contract.findFirst({ where: { id: contractId } });
  if (!existing) throw new AppError('Contract not found', 404, 'NOT_FOUND');

  _assertOwnerOrAdmin(existing, caller);

  // Validate status transition
  if (dto.status && dto.status !== existing.status) {
    _assertStatusTransition(existing.status, dto.status, caller.role);
  }

  const { parties, ...contractData } = dto;

  const updated = await prisma.$transaction(async (tx) => {
    // Replace parties if provided
    if (parties !== undefined) {
      await tx.contractParty.deleteMany({ where: { contractId } });
      await tx.contractParty.createMany({
        data: parties.map((p) => ({ ...p, contractId })),
      });
    }

    const result = await tx.contract.update({
      where: { id: contractId },
      data: contractData,
      include: CONTRACT_INCLUDE,
    });

    // Get the latest version number and increment
    const latestVersion = await tx.contractVersion.findFirst({
      where: { contractId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });

    await tx.contractVersion.create({
      data: {
        contractId,
        versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
        snapshot: _buildSnapshot(result),
        changedById: caller.id,
      },
    });

    return result;
  });

  const isStatusChange = dto.status && dto.status !== existing.status;

  logEvent({
    actorId: caller.id,
    action: isStatusChange ? ACTIONS.CONTRACT_STATUS_CHANGED : ACTIONS.CONTRACT_UPDATED,
    entityType: 'contract',
    entityId: contractId,
    contractId,
    diff: isStatusChange
      ? { before: { status: existing.status }, after: { status: dto.status } }
      : null,
  });

  return { contract: updated, previousStatus: existing.status };
}

// ─────────────────────────────────────────────────────────────────────────────
// Soft Delete
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Soft-deletes a contract by setting deletedAt.
 * Users can only delete DRAFT contracts; Admins can delete any non-final contract.
 *
 * @param {string} contractId
 * @param {object} caller  - { id, role }
 */
async function deleteContract(contractId, caller) {
  // Bypass soft-delete middleware to find even deleted (already deleted) contracts
  const existing = await prisma.contract.findFirst({
    where: { id: contractId, deletedAt: null },
  });

  if (!existing) throw new AppError('Contract not found', 404, 'NOT_FOUND');

  _assertOwnerOrAdmin(existing, caller);

  // Users cannot delete ACTIVE/EXECUTED/EXPIRED contracts
  if (caller.role !== 'ADMIN' && existing.status !== 'DRAFT') {
    throw new AppError(
      'Only DRAFT contracts can be deleted. Contact an administrator for other deletions.',
      422,
      'INVALID_STATUS_TRANSITION'
    );
  }

  // Admins cannot delete EXECUTED contracts (they are immutable records)
  if (existing.status === 'EXECUTED') {
    throw new AppError('EXECUTED contracts cannot be deleted', 422, 'INVALID_STATUS_TRANSITION');
  }

  await prisma.contract.update({
    where: { id: contractId },
    data: { deletedAt: new Date() },
  });

  logEvent({
    actorId: caller.id,
    action: ACTIONS.CONTRACT_DELETED,
    entityType: 'contract',
    entityId: contractId,
    contractId,
  });

  return existing;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function _assertOwnerOrAdmin(contract, caller) {
  if (caller.role !== 'ADMIN' && contract.createdById !== caller.id) {
    throw new AppError('You do not have permission to access this contract', 403, 'FORBIDDEN');
  }
}

function _assertStatusTransition(from, to, role) {
  if (role === 'ADMIN') return; // Admins bypass transition rules

  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new AppError(
      `Invalid status transition: ${from} → ${to}. Allowed transitions from ${from}: ${allowed.join(', ') || 'none'}`,
      422,
      'INVALID_STATUS_TRANSITION'
    );
  }
}

function _buildSnapshot(contract) {
  // Strip Prisma internal fields and build a clean JSON snapshot
  return {
    id: contract.id,
    title: contract.title,
    description: contract.description,
    startDate: contract.startDate,
    endDate: contract.endDate,
    status: contract.status,
    createdById: contract.createdById,
    parties: (contract.parties ?? []).map((p) => ({
      name: p.name,
      email: p.email,
      role: p.role,
    })),
    capturedAt: new Date().toISOString(),
  };
}

module.exports = {
  listContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  ALLOWED_TRANSITIONS,
};
