'use strict';

const { z } = require('zod');

// Valid status values matching the Prisma enum
const CONTRACT_STATUSES = ['DRAFT', 'ACTIVE', 'EXECUTED', 'EXPIRED'];

const partySchema = z.object({
  name: z.string().trim().min(1, 'Party name is required').max(200),
  email: z.string().trim().toLowerCase().email('Invalid party email').optional().or(z.literal('')).transform(v => v || undefined),
  role: z.string().trim().max(100).optional(),
});

const createContractSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  description: z.string().trim().max(5000).optional(),
  startDate: z.coerce.date({ invalid_type_error: 'startDate must be a valid date' }),
  endDate: z.coerce.date({ invalid_type_error: 'endDate must be a valid date' }),
  parties: z
    .array(partySchema)
    .min(1, 'At least one party is required')
    .max(20, 'Maximum 20 parties allowed'),
}).refine((data) => data.endDate > data.startDate, {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

const updateContractSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().trim().max(5000).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(CONTRACT_STATUSES).optional(),
  parties: z.array(partySchema).min(1).max(20).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) return data.endDate > data.startDate;
    return true;
  },
  { message: 'endDate must be after startDate', path: ['endDate'] }
);

const listContractsQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: z
    .union([z.enum(CONTRACT_STATUSES), z.array(z.enum(CONTRACT_STATUSES))])
    .optional()
    .transform((v) => (v ? (Array.isArray(v) ? v : [v]) : undefined)),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

module.exports = { createContractSchema, updateContractSchema, listContractsQuerySchema };
