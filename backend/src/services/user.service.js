'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { buildPaginationMeta } = require('../utils/pagination');
const { logEvent, ACTIONS } = require('./audit.service');

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Paginated user list with optional filters. Never returns password hashes.
 */
async function listUsers(query) {
  const { search, role, status, page, limit } = query;
  const skip = (page - 1) * limit;
  const where = {};

  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
    ];
  }
  if (role) where.role = role;
  if (status === 'active') where.isActive = true;
  else if (status === 'inactive') where.isActive = false;

  const [users, total, totalUsers, activeUsers, adminCount] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: PUBLIC_USER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ]);

  return {
    users,
    meta: {
      ...buildPaginationMeta({ total, page, limit }),
      stats: { totalUsers, activeUsers, adminCount },
    },
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: PUBLIC_USER_SELECT,
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}

/**
 * @param {string} id
 * @param {{ role?: string, isActive?: boolean }} dto
 * @param {{ id: string }} actor
 */
async function updateUser(id, dto, actor) {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new AppError('User not found', 404, 'NOT_FOUND');

  if (actor.id === id) {
    if (dto.isActive === false) {
      throw new AppError('You cannot deactivate your own account', 400, 'SELF_DEACTIVATE');
    }
    if (dto.role === 'USER' && target.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN', isActive: true },
      });
      if (adminCount <= 1) {
        throw new AppError('Cannot demote the last active admin', 400, 'LAST_ADMIN');
      }
    }
  }

  const data = {};
  if (dto.role !== undefined) data.role = dto.role;
  if (dto.isActive !== undefined) data.isActive = dto.isActive;

  if (Object.keys(data).length === 0) {
    return getUserById(id);
  }

  const before = { role: target.role, isActive: target.isActive };
  const user = await prisma.user.update({
    where: { id },
    data,
    select: PUBLIC_USER_SELECT,
  });

  if (dto.role !== undefined && dto.role !== before.role) {
    logEvent({
      actorId: actor.id,
      action: ACTIONS.USER_ROLE_CHANGED,
      entityType: 'user',
      entityId: id,
      diff: { before: { role: before.role }, after: { role: user.role } },
    });
  }
  if (dto.isActive !== undefined && dto.isActive !== before.isActive) {
    logEvent({
      actorId: actor.id,
      action: ACTIONS.USER_STATUS_CHANGED,
      entityType: 'user',
      entityId: id,
      diff: { before: { isActive: before.isActive }, after: { isActive: user.isActive } },
    });
  }

  return user;
}

/**
 * @param {{ name: string, email: string, password: string, role?: string, isActive?: boolean }} dto
 * @param {{ id: string }} actor
 */
async function createUserByAdmin(dto, actor) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new AppError('An account with this email already exists', 409, 'CONFLICT');

  const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role ?? 'USER',
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    },
    select: PUBLIC_USER_SELECT,
  });

  logEvent({
    actorId: actor.id,
    action: ACTIONS.USER_CREATED_BY_ADMIN,
    entityType: 'user',
    entityId: user.id,
    diff: { after: { email: user.email, role: user.role } },
  });

  return user;
}

module.exports = { listUsers, getUserById, updateUser, createUserByAdmin };
