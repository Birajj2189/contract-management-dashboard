'use strict';

const { z } = require('zod');

const USER_ROLES = ['ADMIN', 'USER'];

const listUsersQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const updateUserSchema = z
  .object({
    role: z.enum(USER_ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.isActive !== undefined, {
    message: 'At least one of role or isActive is required',
  });

const createUserByAdminSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(USER_ROLES).default('USER'),
  isActive: z.boolean().optional().default(true),
});

module.exports = {
  listUsersQuerySchema,
  updateUserSchema,
  createUserByAdminSchema,
};
