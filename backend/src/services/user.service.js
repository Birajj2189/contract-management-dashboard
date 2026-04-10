'use strict';

const prisma = require('../config/db');

const MAX_LIST = 1000;

/**
 * Lists users for admin dashboards. Never returns password hashes.
 */
async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: MAX_LIST,
  });
}

module.exports = { listUsers };
