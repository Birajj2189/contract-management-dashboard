-- Migration: 20240001_initial
-- Contract Management Dashboard — Initial Schema
-- Run with: npx prisma migrate deploy (when DATABASE_URL is set)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXECUTED', 'EXPIRED');

-- Users
CREATE TABLE "users" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "email"         TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "role"          "Role" NOT NULL DEFAULT 'USER',
    "is_active"     BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Refresh Tokens
CREATE TABLE "refresh_tokens" (
    "id"                TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "token"             TEXT NOT NULL,
    "user_id"           TEXT NOT NULL,
    "expires_at"        TIMESTAMP(3) NOT NULL,
    "revoked_at"        TIMESTAMP(3),
    "replaced_by_token" TEXT,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Contracts
CREATE TABLE "contracts" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title"         TEXT NOT NULL,
    "description"   TEXT,
    "start_date"    TIMESTAMP(3) NOT NULL,
    "end_date"      TIMESTAMP(3) NOT NULL,
    "status"        "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT NOT NULL,
    "deleted_at"    TIMESTAMP(3),
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contracts_created_by_id_idx" ON "contracts"("created_by_id");
CREATE INDEX "contracts_status_idx" ON "contracts"("status");
CREATE INDEX "contracts_deleted_at_idx" ON "contracts"("deleted_at");
CREATE INDEX "contracts_created_by_id_deleted_at_idx" ON "contracts"("created_by_id", "deleted_at");
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON UPDATE CASCADE;

-- Contract Parties
CREATE TABLE "contract_parties" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "contract_id" TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "email"       TEXT,
    "role"        TEXT,
    CONSTRAINT "contract_parties_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contract_parties_contract_id_idx" ON "contract_parties"("contract_id");
CREATE INDEX "contract_parties_name_idx" ON "contract_parties"("name");
ALTER TABLE "contract_parties" ADD CONSTRAINT "contract_parties_contract_id_fkey"
    FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Contract Versions (snapshots)
CREATE TABLE "contract_versions" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "contract_id"    TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "snapshot"       JSONB NOT NULL,
    "changed_by_id"  TEXT NOT NULL,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contract_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "contract_versions_contract_id_version_number_key"
    ON "contract_versions"("contract_id", "version_number");
CREATE INDEX "contract_versions_contract_id_idx" ON "contract_versions"("contract_id");
ALTER TABLE "contract_versions" ADD CONSTRAINT "contract_versions_contract_id_fkey"
    FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contract_versions" ADD CONSTRAINT "contract_versions_changed_by_id_fkey"
    FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON UPDATE CASCADE;

-- Audit Logs
CREATE TABLE "audit_logs" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "contract_id" TEXT,
    "actor_id"    TEXT NOT NULL,
    "action"      TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id"   TEXT,
    "diff"        JSONB,
    "ip_address"  TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_contract_id_idx" ON "audit_logs"("contract_id");
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_contract_id_fkey"
    FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON UPDATE CASCADE;
