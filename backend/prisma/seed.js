'use strict';

/**
 * Seed script — creates bulk dummy data for development/testing.
 *
 * Run with:
 *   node prisma/seed.js
 *
 * Idempotent: clears existing data (except _prisma_migrations) before seeding.
 */

require('dotenv').config();

const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const randomPast = (daysAgo = 365) =>
  randomDate(new Date(Date.now() - daysAgo * 86400000), new Date())

const randomFuture = (daysAhead = 365) =>
  randomDate(new Date(), new Date(Date.now() + daysAhead * 86400000))

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const CONTRACT_STATUSES = ['DRAFT', 'ACTIVE', 'EXECUTED', 'EXPIRED']

const PARTY_ROLES = ['Buyer', 'Seller', 'Witness', 'Guarantor', 'Consultant', 'Vendor', 'Client']

const CONTRACT_TITLES = [
  'Software Development Services Agreement',
  'Cloud Infrastructure Hosting Contract',
  'Annual Maintenance & Support Agreement',
  'Data Processing Addendum',
  'Non-Disclosure Agreement — Q1 2024',
  'Marketing Agency Retainer Contract',
  'Office Lease Agreement',
  'Equipment Supply Contract',
  'Professional Consulting Services Agreement',
  'API Integration Partnership Contract',
  'SaaS Subscription Agreement',
  'HR Outsourcing Services Contract',
  'Legal Advisory Retainer',
  'Security Audit & Penetration Testing Contract',
  'Content Creation & Management Agreement',
  'Logistics & Shipping Services Contract',
  'Financial Advisory Agreement',
  'Website Development & Design Contract',
  'Mobile Application Development Agreement',
  'Cybersecurity Monitoring Services Contract',
  'Vendor Management Framework Agreement',
  'Employee Secondment Agreement',
  'Intellectual Property Licensing Agreement',
  'Joint Venture Formation Contract',
  'Merger & Acquisition Advisory Agreement',
  'Training & Development Services Contract',
  'Insurance Broker Services Agreement',
  'Real Estate Management Contract',
  'Translation & Localization Services Agreement',
  'Event Management Services Contract',
]

const CONTRACT_DESCRIPTIONS = [
  'This agreement governs the provision of software development services including design, development, testing, and deployment.',
  'Comprehensive hosting and infrastructure management contract covering uptime SLAs, disaster recovery, and security compliance.',
  'Annual contract for ongoing maintenance, bug fixes, and technical support for all production systems.',
  'Data processing agreement in compliance with GDPR and applicable data protection regulations.',
  'Mutual non-disclosure agreement protecting confidential business information and trade secrets shared between parties.',
  'Retainer agreement for monthly marketing strategy, campaign management, and performance reporting.',
  null,
  'Supply contract for hardware equipment including warranties, delivery timelines, and return policies.',
  'Consulting services covering strategic planning, process optimization, and technology advisory.',
  'Partnership agreement for API integration, data exchange, and joint product development.',
]

const PARTY_NAMES = [
  { name: 'Acme Technologies Ltd', email: 'contracts@acme.com' },
  { name: 'Global Ventures Inc', email: 'legal@globalventures.com' },
  { name: 'DataStream Solutions', email: 'agreements@datastream.io' },
  { name: 'NovaBuild Corp', email: 'contracts@novabuild.com' },
  { name: 'FinTech Partners LLC', email: 'legal@fintechpartners.com' },
  { name: 'CloudBase Systems', email: 'contracts@cloudbase.tech' },
  { name: 'Meridian Consulting', email: 'info@meridianconsulting.com' },
  { name: 'Pacific Trade Group', email: 'trade@pacificgroup.com' },
  { name: 'Summit Legal Associates', email: 'office@summitlegal.com' },
  { name: 'AlphaCore Industries', email: 'procurement@alphacore.com' },
  { name: 'Bright Futures Foundation', email: 'admin@brightfutures.org' },
  { name: 'Nexus Digital Agency', email: 'contracts@nexusdigital.co' },
  { name: 'Sterling Financial Group', email: 'legal@sterlingfg.com' },
  { name: 'TechHub Innovations', email: 'hello@techhub.io' },
  { name: 'Harbor Logistics Inc', email: 'ops@harborlogistics.com' },
]

// ─── Main seed function ──────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting seed...\n')

  // ── 1. Clear existing data (order matters for FK constraints) ──────────────
  console.log('🗑   Clearing existing data...')
  await prisma.auditLog.deleteMany()
  await prisma.contractVersion.deleteMany()
  await prisma.contractParty.deleteMany()
  await prisma.contract.deleteMany({ where: { deletedAt: { not: null } } })
  // Delete all contracts (bypassing soft-delete extension with raw)
  await prisma.$executeRaw`DELETE FROM contracts`
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  console.log('   ✓ Done\n')

  // ── 2. Create users ────────────────────────────────────────────────────────
  console.log('👤  Creating users...')
  const passwordHash = await bcrypt.hash('Password123!', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@contracthub.com',
      passwordHash,
      role: 'ADMIN',
    },
  })

  const users = await Promise.all([
    prisma.user.create({
      data: { name: 'Alice Johnson', email: 'alice@contracthub.com', passwordHash },
    }),
    prisma.user.create({
      data: { name: 'Bob Martinez', email: 'bob@contracthub.com', passwordHash },
    }),
    prisma.user.create({
      data: { name: 'Carol White', email: 'carol@contracthub.com', passwordHash },
    }),
    prisma.user.create({
      data: { name: 'David Chen', email: 'david@contracthub.com', passwordHash },
    }),
  ])

  const allUsers = [admin, ...users]
  console.log(`   ✓ Created ${allUsers.length} users\n`)

  // ── 3. Create contracts ────────────────────────────────────────────────────
  console.log('📄  Creating contracts...')
  const contracts = []

  for (let i = 0; i < CONTRACT_TITLES.length; i++) {
    const title = CONTRACT_TITLES[i]
    const status = pick(CONTRACT_STATUSES)
    const owner = pick(allUsers)

    const startDate = randomPast(400)
    const endDate =
      status === 'EXPIRED'
        ? randomDate(startDate, new Date()) // end date in the past
        : randomFuture(400)

    const contract = await prisma.contract.create({
      data: {
        title,
        description: pick(CONTRACT_DESCRIPTIONS),
        startDate,
        endDate,
        status,
        createdById: owner.id,
        createdAt: randomPast(200),
        parties: {
          create: [
            // Primary party (always present)
            {
              name: pick(PARTY_NAMES).name,
              email: pick(PARTY_NAMES).email,
              role: pick(PARTY_ROLES),
            },
            // Secondary party (always present)
            {
              name: pick(PARTY_NAMES).name,
              email: pick(PARTY_NAMES).email,
              role: pick(PARTY_ROLES),
            },
            // Optional third party
            ...(Math.random() > 0.5
              ? [
                  {
                    name: pick(PARTY_NAMES).name,
                    email: pick(PARTY_NAMES).email,
                    role: pick(PARTY_ROLES),
                  },
                ]
              : []),
          ],
        },
      },
    })

    contracts.push({ contract, owner })
  }

  console.log(`   ✓ Created ${contracts.length} contracts\n`)

  // ── 4. Create contract versions ────────────────────────────────────────────
  console.log('🔖  Creating contract versions...')
  let totalVersions = 0

  for (const { contract, owner } of contracts) {
    const versionCount = Math.floor(Math.random() * 3) + 1 // 1–3 versions

    for (let v = 1; v <= versionCount; v++) {
      await prisma.contractVersion.create({
        data: {
          contractId: contract.id,
          versionNumber: v,
          changedById: pick(allUsers).id,
          snapshot: {
            title: contract.title,
            description: contract.description,
            status: contract.status,
            startDate: contract.startDate,
            endDate: contract.endDate,
            version: v,
          },
        },
      })
      totalVersions++
    }
  }

  console.log(`   ✓ Created ${totalVersions} contract versions\n`)

  // ── 5. Create audit logs ───────────────────────────────────────────────────
  console.log('📋  Creating audit logs...')
  let totalLogs = 0

  // Auth events (login/logout for all users)
  for (const user of allUsers) {
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user.id,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      },
    })
    totalLogs++

    // A few login events
    for (let i = 0; i < Math.floor(Math.random() * 4) + 1; i++) {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'LOGIN',
          entityType: 'User',
          entityId: user.id,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        },
      })
      totalLogs++
    }
  }

  // Contract events
  for (const { contract, owner } of contracts) {
    await prisma.auditLog.create({
      data: {
        contractId: contract.id,
        actorId: owner.id,
        action: 'CONTRACT_CREATED',
        entityType: 'Contract',
        entityId: contract.id,
        diff: { after: { status: contract.status, title: contract.title } },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      },
    })
    totalLogs++

    // Some contracts have update audit entries
    if (Math.random() > 0.4) {
      await prisma.auditLog.create({
        data: {
          contractId: contract.id,
          actorId: pick(allUsers).id,
          action: 'CONTRACT_UPDATED',
          entityType: 'Contract',
          entityId: contract.id,
          diff: {
            before: { status: 'DRAFT' },
            after: { status: contract.status },
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        },
      })
      totalLogs++
    }
  }

  console.log(`   ✓ Created ${totalLogs} audit log entries\n`)

  // ── 6. Print summary ───────────────────────────────────────────────────────
  console.log('─'.repeat(50))
  console.log('✅  Seed complete!\n')
  console.log('📊  Summary:')
  console.log(`   Users:             ${allUsers.length}`)
  console.log(`   Contracts:         ${contracts.length}`)
  console.log(`   Contract versions: ${totalVersions}`)
  console.log(`   Audit log entries: ${totalLogs}`)
  console.log('\n🔑  Login credentials (all accounts):')
  console.log('   Email:    admin@contracthub.com   | Role: ADMIN')
  console.log('   Email:    alice@contracthub.com   | Role: USER')
  console.log('   Email:    bob@contracthub.com     | Role: USER')
  console.log('   Email:    carol@contracthub.com   | Role: USER')
  console.log('   Email:    david@contracthub.com   | Role: USER')
  console.log('   Password: Password123!  (all accounts)')
  console.log('─'.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
