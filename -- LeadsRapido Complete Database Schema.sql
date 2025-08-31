-- LeadsRapido Complete Database Schema
-- Generated from Prisma schema for PostgreSQL 16+

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types/enums
CREATE TYPE "UserRole" AS ENUM ('admin', 'org_admin', 'agent', 'viewer');
CREATE TYPE "OrganizationPlan" AS ENUM ('basic', 'professional', 'enterprise', 'white_label');
CREATE TYPE "ActivityType" AS ENUM ('call', 'email', 'meeting', 'note');
CREATE TYPE "LeadSource" AS ENUM ('linkedin_scraping', 'web_scraping', 'crunchbase_api', 'manual_import', 'api_integration');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ACCESS', 'EXPORT');
CREATE TYPE "SearchStatus" AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE "ProcessingStatus" AS ENUM ('raw', 'enriching', 'enriched', 'validated', 'imported', 'failed');
CREATE TYPE "LogLevel" AS ENUM ('debug', 'info', 'warn', 'error');

-- Core Tables

-- Organizations table
CREATE TABLE "organizations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "cnpj" VARCHAR(18) UNIQUE,
    "subdomain" VARCHAR(63) UNIQUE,
    "plan" "OrganizationPlan" NOT NULL DEFAULT 'basic',
    "quota_total" INTEGER NOT NULL DEFAULT 1000,
    "quota_used" INTEGER NOT NULL DEFAULT 0,
    "quota_reset_date" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month'),
    "billing_email" VARCHAR(255),
    "billing_address" JSONB,
    "stripe_customer_id" VARCHAR(255),
    "settings" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'agent',
    "avatar_url" VARCHAR(512),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "users_organization_id_email_key" UNIQUE ("organization_id", "email")
);

-- Lead segments table
CREATE TABLE "lead_segments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_segments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lead_segments_organization_id_name_key" UNIQUE ("organization_id", "name")
);

-- Leads table (partitioned by organization_id)
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "company" VARCHAR(255),
    "position" VARCHAR(255),
    "website" VARCHAR(512),
    "linkedin_url" VARCHAR(512),
    "address_street" VARCHAR(255),
    "address_city" VARCHAR(100),
    "address_state" VARCHAR(50),
    "address_zip_code" VARCHAR(20),
    "address_country" VARCHAR(50) DEFAULT 'Brasil',
    "address_coordinates" POINT,
    "segment_id" UUID NOT NULL,
    "quality_score" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT '{}',
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "source" "LeadSource" NOT NULL DEFAULT 'manual_import',
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_enriched_at" TIMESTAMP(3),
    "data_confidence" DECIMAL(3,2) NOT NULL DEFAULT 0.50,
    "access_cost" DECIMAL(10,2) NOT NULL DEFAULT 2.50,
    "is_accessed" BOOLEAN NOT NULL DEFAULT false,
    "accessed_at" TIMESTAMP(3),
    "accessed_by_user_id" UUID,
    "duplicate_hash" VARCHAR(64),
    "search_vector" TSVECTOR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id", "organization_id"),
    CONSTRAINT "leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "leads_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "lead_segments"("id") ON UPDATE CASCADE,
    CONSTRAINT "leads_accessed_by_user_id_fkey" FOREIGN KEY ("accessed_by_user_id") REFERENCES "users"("id") ON UPDATE CASCADE
) PARTITION BY HASH ("organization_id");

-- Create lead partitions
DO $$
BEGIN
    FOR i IN 0..15 LOOP
        EXECUTE format('CREATE TABLE leads_part_%s PARTITION OF leads FOR VALUES WITH (modulus 16, remainder %s)', i, i);
    END LOOP;
END $$;

-- Lead accesses table
CREATE TABLE "lead_accesses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "billing_period" VARCHAR(7) NOT NULL,
    "ip_address" INET,
    "user_agent" TEXT,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_accesses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lead_accesses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE CASCADE
);

-- Pipeline stages table
CREATE TABLE "pipeline_stages" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    "stage_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pipeline_stages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pipeline_stages_organization_id_stage_order_key" UNIQUE ("organization_id", "stage_order"),
    CONSTRAINT "pipeline_stages_organization_id_name_key" UNIQUE ("organization_id", "name")
);

-- Pipeline leads table
CREATE TABLE "pipeline_leads" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "stage_id" UUID NOT NULL,
    "assigned_user_id" UUID,
    "estimated_value" DECIMAL(12,2),
    "probability" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "close_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pipeline_leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pipeline_leads_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON UPDATE CASCADE,
    CONSTRAINT "pipeline_leads_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON UPDATE CASCADE,
    CONSTRAINT "pipeline_leads_organization_id_lead_id_key" UNIQUE ("organization_id", "lead_id")
);

-- Activities table
CREATE TABLE "activities" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "pipeline_lead_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "activities_pipeline_lead_id_fkey" FOREIGN KEY ("pipeline_lead_id") REFERENCES "pipeline_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE CASCADE
);

-- API keys table
CREATE TABLE "api_keys" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "key_hash" VARCHAR(255) NOT NULL UNIQUE,
    "key_prefix" VARCHAR(10) NOT NULL,
    "permissions" TEXT[] DEFAULT '{}',
    "last_used_at" TIMESTAMP(3),
    "usage_count" BIGINT NOT NULL DEFAULT 0,
    "rate_limit_per_hour" INTEGER NOT NULL DEFAULT 1000,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "api_keys_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE CASCADE
);

-- Webhooks table
CREATE TABLE "webhooks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "url" VARCHAR(512) NOT NULL,
    "events" TEXT[] NOT NULL,
    "secret_key" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_success_at" TIMESTAMP(3),
    "last_failure_at" TIMESTAMP(3),
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "rate_limit_per_minute" INTEGER NOT NULL DEFAULT 60,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "webhooks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Daily usage stats table
CREATE TABLE "daily_usage_stats" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "leads_collected" INTEGER NOT NULL DEFAULT 0,
    "leads_accessed" INTEGER NOT NULL DEFAULT 0,
    "api_requests" INTEGER NOT NULL DEFAULT 0,
    "unique_users" INTEGER NOT NULL DEFAULT 0,
    "avg_quality_score" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "total_access_cost" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "avg_response_time_ms" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_usage_stats_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "daily_usage_stats_organization_id_date_key" UNIQUE ("organization_id", "date")
);

-- Audit logs table (partitioned by created_at)
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "organization_id" UUID,
    "user_id" UUID,
    "action" "AuditAction" NOT NULL,
    "resource_type" VARCHAR(50) NOT NULL,
    "resource_id" UUID,
    "resource_data" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "session_id" VARCHAR(255),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id", "created_at"),
    CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
) PARTITION BY RANGE ("created_at");

-- Create audit log partitions for current and future months
DO $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..12 LOOP
        start_date := date_trunc('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
        end_date := start_date + INTERVAL '1 month';
        partition_name := 'audit_logs_' || to_char(start_date, 'YYYY_MM');
        
        EXECUTE format('CREATE TABLE %I PARTITION OF audit_logs FOR VALUES FROM (%L) TO (%L)',
                      partition_name, start_date, end_date);
    END LOOP;
END $$;

-- Authentication tables

-- Refresh tokens table
CREATE TABLE "refresh_tokens" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL UNIQUE,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Password reset tokens table
CREATE TABLE "password_reset_tokens" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL UNIQUE,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Email verification tokens table
CREATE TABLE "email_verification_tokens" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL UNIQUE,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Task Worker System Tables

-- Searches table
CREATE TABLE "searches" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "query" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "segment_id" UUID,
    "status" "SearchStatus" NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "results_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "worker_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "searches_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "searches_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "lead_segments"("id") ON UPDATE CASCADE
);

-- Raw leads table (partitioned by organization_id)
CREATE TABLE "raw_leads" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "search_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(20),
    "website" VARCHAR(500),
    "rating" DECIMAL(2,1),
    "reviews_count" INTEGER,
    "category" VARCHAR(100),
    "business_hours" JSONB,
    "photos" JSONB,
    "google_place_id" VARCHAR(255) UNIQUE,
    "google_url" TEXT,
    "processing_status" "ProcessingStatus" NOT NULL DEFAULT 'raw',
    "quality_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id", "organization_id"),
    CONSTRAINT "raw_leads_search_id_fkey" FOREIGN KEY ("search_id") REFERENCES "searches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "raw_leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
) PARTITION BY HASH ("organization_id");

-- Create raw_leads partitions
DO $$
BEGIN
    FOR i IN 0..15 LOOP
        EXECUTE format('CREATE TABLE raw_leads_part_%s PARTITION OF raw_leads FOR VALUES WITH (modulus 16, remainder %s)', i, i);
    END LOOP;
END $$;

-- Enriched data table
CREATE TABLE "enriched_data" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "raw_lead_id" UUID NOT NULL UNIQUE,
    "organization_id" UUID NOT NULL,
    "cnpj" VARCHAR(18),
    "company_size" VARCHAR(50),
    "sector" VARCHAR(100),
    "annual_revenue" BIGINT,
    "employees_count" INTEGER,
    "foundation_date" DATE,
    "legal_nature" VARCHAR(100),
    "verified_phone" VARCHAR(20),
    "verified_email" VARCHAR(255),
    "social_networks" JSONB,
    "technologies" JSONB,
    "enrichment_source" VARCHAR(100),
    "enrichment_confidence" DECIMAL(3,2) DEFAULT 0.50,
    "enrichment_cost" DECIMAL(10,4) DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enriched_data_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Worker logs table
CREATE TABLE "worker_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "worker_id" VARCHAR(100) NOT NULL,
    "search_id" UUID,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "worker_logs_search_id_fkey" FOREIGN KEY ("search_id") REFERENCES "searches"("id") ON UPDATE CASCADE
);

-- Create indexes for better performance

-- Organizations indexes
CREATE INDEX "idx_organizations_status" ON "organizations"("status");
CREATE INDEX "idx_organizations_plan" ON "organizations"("plan");
CREATE INDEX "idx_organizations_subdomain" ON "organizations"("subdomain");

-- Users indexes
CREATE INDEX "idx_users_organization_id" ON "users"("organization_id");
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_is_active" ON "users"("is_active");

-- Lead segments indexes
CREATE INDEX "idx_lead_segments_organization_id" ON "lead_segments"("organization_id");

-- Leads indexes (created on each partition)
CREATE INDEX "idx_leads_organization_id" ON "leads"("organization_id");
CREATE INDEX "idx_leads_segment_id" ON "leads"("segment_id");
CREATE INDEX "idx_leads_source" ON "leads"("source");
CREATE INDEX "idx_leads_quality_score" ON "leads"("quality_score");
CREATE INDEX "idx_leads_is_accessed" ON "leads"("is_accessed");
CREATE INDEX "idx_leads_created_at" ON "leads"("created_at");
CREATE INDEX "idx_leads_email" ON "leads"("email") WHERE "email" IS NOT NULL;
CREATE INDEX "idx_leads_phone" ON "leads"("phone") WHERE "phone" IS NOT NULL;
CREATE INDEX "idx_leads_company" ON "leads"("company") WHERE "company" IS NOT NULL;
CREATE INDEX "idx_leads_duplicate_hash" ON "leads"("duplicate_hash") WHERE "duplicate_hash" IS NOT NULL;
CREATE INDEX "idx_leads_search_vector" ON "leads" USING gin("search_vector");
CREATE INDEX "idx_leads_address_coordinates" ON "leads" USING gist("address_coordinates") WHERE "address_coordinates" IS NOT NULL;

-- Lead accesses indexes
CREATE INDEX "idx_lead_accesses_organization_id" ON "lead_accesses"("organization_id");
CREATE INDEX "idx_lead_accesses_lead_id" ON "lead_accesses"("lead_id");
CREATE INDEX "idx_lead_accesses_user_id" ON "lead_accesses"("user_id");
CREATE INDEX "idx_lead_accesses_billing_period" ON "lead_accesses"("billing_period");
CREATE INDEX "idx_lead_accesses_accessed_at" ON "lead_accesses"("accessed_at");

-- Pipeline stages indexes
CREATE INDEX "idx_pipeline_stages_organization_id" ON "pipeline_stages"("organization_id");
CREATE INDEX "idx_pipeline_stages_stage_order" ON "pipeline_stages"("stage_order");

-- Pipeline leads indexes
CREATE INDEX "idx_pipeline_leads_organization_id" ON "pipeline_leads"("organization_id");
CREATE INDEX "idx_pipeline_leads_lead_id" ON "pipeline_leads"("lead_id");
CREATE INDEX "idx_pipeline_leads_stage_id" ON "pipeline_leads"("stage_id");
CREATE INDEX "idx_pipeline_leads_assigned_user_id" ON "pipeline_leads"("assigned_user_id");

-- Activities indexes
CREATE INDEX "idx_activities_organization_id" ON "activities"("organization_id");
CREATE INDEX "idx_activities_pipeline_lead_id" ON "activities"("pipeline_lead_id");
CREATE INDEX "idx_activities_user_id" ON "activities"("user_id");
CREATE INDEX "idx_activities_type" ON "activities"("type");
CREATE INDEX "idx_activities_scheduled_at" ON "activities"("scheduled_at");

-- API keys indexes
CREATE INDEX "idx_api_keys_organization_id" ON "api_keys"("organization_id");
CREATE INDEX "idx_api_keys_user_id" ON "api_keys"("user_id");
CREATE INDEX "idx_api_keys_is_active" ON "api_keys"("is_active");

-- Webhooks indexes
CREATE INDEX "idx_webhooks_organization_id" ON "webhooks"("organization_id");
CREATE INDEX "idx_webhooks_is_active" ON "webhooks"("is_active");

-- Daily usage stats indexes
CREATE INDEX "idx_daily_usage_stats_organization_id" ON "daily_usage_stats"("organization_id");
CREATE INDEX "idx_daily_usage_stats_date" ON "daily_usage_stats"("date");

-- Audit logs indexes
CREATE INDEX "idx_audit_logs_organization_id" ON "audit_logs"("organization_id");
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");
CREATE INDEX "idx_audit_logs_resource_type" ON "audit_logs"("resource_type");
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at");

-- Authentication tokens indexes
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");
CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens"("expires_at");
CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens"("user_id");
CREATE INDEX "idx_email_verification_tokens_user_id" ON "email_verification_tokens"("user_id");

-- Task Worker indexes
CREATE INDEX "idx_searches_organization_id" ON "searches"("organization_id");
CREATE INDEX "idx_searches_status" ON "searches"("status");
CREATE INDEX "idx_searches_worker_id" ON "searches"("worker_id");
CREATE INDEX "idx_searches_created_at" ON "searches"("created_at");

CREATE INDEX "idx_raw_leads_search_id" ON "raw_leads"("search_id");
CREATE INDEX "idx_raw_leads_organization_id" ON "raw_leads"("organization_id");
CREATE INDEX "idx_raw_leads_processing_status" ON "raw_leads"("processing_status");
CREATE INDEX "idx_raw_leads_google_place_id" ON "raw_leads"("google_place_id") WHERE "google_place_id" IS NOT NULL;

CREATE INDEX "idx_enriched_data_raw_lead_id" ON "enriched_data"("raw_lead_id");
CREATE INDEX "idx_enriched_data_organization_id" ON "enriched_data"("organization_id");
CREATE INDEX "idx_enriched_data_cnpj" ON "enriched_data"("cnpj") WHERE "cnpj" IS NOT NULL;

CREATE INDEX "idx_worker_logs_worker_id" ON "worker_logs"("worker_id");
CREATE INDEX "idx_worker_logs_search_id" ON "worker_logs"("search_id");
CREATE INDEX "idx_worker_logs_level" ON "worker_logs"("level");
CREATE INDEX "idx_worker_logs_created_at" ON "worker_logs"("created_at");

-- Create triggers for updated_at fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables that have updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_segments_updated_at BEFORE UPDATE ON lead_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipeline_leads_updated_at BEFORE UPDATE ON pipeline_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_searches_updated_at BEFORE UPDATE ON searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_raw_leads_updated_at BEFORE UPDATE ON raw_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enriched_data_updated_at BEFORE UPDATE ON enriched_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update lead search vector
CREATE OR REPLACE FUNCTION update_lead_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('portuguese', COALESCE(NEW.name, '')), 'A') ||
                        setweight(to_tsvector('portuguese', COALESCE(NEW.company, '')), 'A') ||
                        setweight(to_tsvector('portuguese', COALESCE(NEW.email, '')), 'B') ||
                        setweight(to_tsvector('portuguese', COALESCE(NEW.phone, '')), 'B') ||
                        setweight(to_tsvector('portuguese', COALESCE(NEW.position, '')), 'C') ||
                        setweight(to_tsvector('portuguese', COALESCE(NEW.address_city, '')), 'C') ||
                        setweight(to_tsvector('portuguese', array_to_string(NEW.tags, ' ')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply search vector trigger to leads table
CREATE TRIGGER update_leads_search_vector BEFORE INSERT OR UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_lead_search_vector();

-- Create audit logging function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    organization_id_value UUID;
    action_value audit_action;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Determine the organization_id
    IF TG_OP = 'DELETE' THEN
        organization_id_value := OLD.organization_id;
        action_value := 'DELETE';
        old_data := row_to_json(OLD)::JSONB;
        new_data := NULL;
    ELSE
        organization_id_value := NEW.organization_id;
        old_data := CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::JSONB ELSE NULL END;
        new_data := row_to_json(NEW)::JSONB;
        action_value := CASE WHEN TG_OP = 'INSERT' THEN 'CREATE' ELSE 'UPDATE' END;
    END IF;

    INSERT INTO audit_logs (
        organization_id,
        action,
        resource_type,
        resource_id,
        resource_data,
        metadata
    ) VALUES (
        organization_id_value,
        action_value,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        COALESCE(new_data, old_data),
        jsonb_build_object(
            'old_data', old_data,
            'new_data', new_data,
            'operation', TG_OP
        )
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_organizations AFTER INSERT OR UPDATE OR DELETE ON organizations FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON leads FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_lead_accesses AFTER INSERT OR UPDATE OR DELETE ON lead_accesses FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Create quota management function
CREATE OR REPLACE FUNCTION update_organization_quota()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE organizations 
        SET quota_used = quota_used + 1 
        WHERE id = NEW.organization_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE organizations 
        SET quota_used = GREATEST(quota_used - 1, 0) 
        WHERE id = OLD.organization_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply quota trigger to leads table
CREATE TRIGGER update_quota_on_lead_change AFTER INSERT OR DELETE ON leads FOR EACH ROW EXECUTE FUNCTION update_organization_quota();

-- Create function to automatically reset quotas monthly
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
    UPDATE organizations 
    SET quota_used = 0,
        quota_reset_date = quota_reset_date + INTERVAL '1 month'
    WHERE quota_reset_date <= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create materialized views for analytics

-- Lead quality distribution view
CREATE MATERIALIZED VIEW mv_lead_quality_distribution AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    CASE 
        WHEN l.quality_score >= 80 THEN 'High'
        WHEN l.quality_score >= 60 THEN 'Medium'
        WHEN l.quality_score >= 40 THEN 'Low'
        ELSE 'Very Low'
    END as quality_tier,
    COUNT(*) as lead_count,
    AVG(l.quality_score) as avg_quality_score
FROM organizations o
LEFT JOIN leads l ON o.id = l.organization_id
GROUP BY o.id, o.name, quality_tier;

CREATE UNIQUE INDEX ON mv_lead_quality_distribution (organization_id, quality_tier);

-- Lead geographic distribution view
CREATE MATERIALIZED VIEW mv_lead_geographic_distribution AS
SELECT 
    l.organization_id,
    l.address_state,
    l.address_city,
    COUNT(*) as lead_count,
    AVG(l.quality_score) as avg_quality_score,
    COUNT(*) FILTER (WHERE l.is_accessed = true) as accessed_count
FROM leads l
WHERE l.address_state IS NOT NULL
GROUP BY l.organization_id, l.address_state, l.address_city;

CREATE UNIQUE INDEX ON mv_lead_geographic_distribution (organization_id, address_state, address_city);

-- Monthly organization metrics view
CREATE MATERIALIZED VIEW mv_monthly_org_metrics AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    date_trunc('month', dus.date) as month,
    SUM(dus.leads_collected) as total_leads_collected,
    SUM(dus.leads_accessed) as total_leads_accessed,
    SUM(dus.api_requests) as total_api_requests,
    AVG(dus.avg_quality_score) as avg_quality_score,
    SUM(dus.total_access_cost) as total_revenue
FROM organizations o
LEFT JOIN daily_usage_stats dus ON o.id = dus.organization_id
GROUP BY o.id, o.name, date_trunc('month', dus.date);

CREATE UNIQUE INDEX ON mv_monthly_org_metrics (organization_id, month);

-- Create functions to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lead_quality_distribution;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lead_geographic_distribution;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_org_metrics;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Clean up old refresh tokens (older than 30 days)
    DELETE FROM refresh_tokens WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Clean up expired password reset tokens
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
    
    -- Clean up expired email verification tokens
    DELETE FROM email_verification_tokens WHERE expires_at < NOW();
    
    -- Clean up old worker logs (older than 90 days)
    DELETE FROM worker_logs WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Clean up old audit logs (older than 1 year)
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) on multi-tenant tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_accesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE enriched_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - should be customized based on application needs)
CREATE POLICY "Users can access their own organization data" ON organizations
    FOR ALL USING (id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY "Users can access their own organization users" ON users
    FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

CREATE POLICY "Users can access their own organization leads" ON leads
    FOR ALL USING (organization_id = current_setting('app.current_organization_id')::UUID);

-- Add similar policies for other tables as needed

-- Create initial admin user function
CREATE OR REPLACE FUNCTION create_initial_admin(
    org_name TEXT,
    admin_email TEXT,
    admin_name TEXT,
    admin_password TEXT
)
RETURNS UUID AS $$
DECLARE
    org_id UUID;
    user_id UUID;
    password_hash TEXT;
BEGIN
    -- Create organization
    INSERT INTO organizations (name, plan)
    VALUES (org_name, 'enterprise')
    RETURNING id INTO org_id;
    
    -- Hash password (in real implementation, use proper password hashing)
    password_hash := admin_password; -- This should be properly hashed
    
    -- Create admin user
    INSERT INTO users (organization_id, email, name, password_hash, role, email_verified)
    VALUES (org_id, admin_email, admin_name, password_hash, 'admin', true)
    RETURNING id INTO user_id;
    
    -- Create default lead segment
    INSERT INTO lead_segments (organization_id, name, description)
    VALUES (org_id, 'Geral', 'Segmento padrão para todos os leads');
    
    -- Create default pipeline stages
    INSERT INTO pipeline_stages (organization_id, name, stage_order) VALUES
    (org_id, 'Novo Lead', 1),
    (org_id, 'Qualificado', 2),
    (org_id, 'Proposta', 3),
    (org_id, 'Negociação', 4),
    (org_id, 'Fechado', 5);
    
    RETURN org_id;
END;
$$ LANGUAGE plpgsql;

-- Create database statistics function
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    size_pretty TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins - n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size_pretty
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert initial data for testing
DO $$
DECLARE
    org_id UUID;
BEGIN
    -- Create test organization if not exists
    SELECT create_initial_admin(
        'LeadsRapido Demo',
        'admin@leadsrapido.com',
        'Admin Leadsrapido',
        'admin123'
    ) INTO org_id;
    
    -- Refresh materialized views
    PERFORM refresh_analytics_views();
END $$;

-- Create indexes for better performance on new tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_leads_full_text_search" ON "leads" USING gin("search_vector");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_leads_coordinates" ON "leads" USING gist("address_coordinates") WHERE "address_coordinates" IS NOT NULL;

-- Final comments and documentation
COMMENT ON DATABASE "leadsrapido" IS 'LeadsRapido - Sistema completo de CRM e coleta de leads via web scraping';
COMMENT ON TABLE "organizations" IS 'Organizações/empresas que usam o sistema (multi-tenant)';
COMMENT ON TABLE "users" IS 'Usuários do sistema, vinculados a organizações';
COMMENT ON TABLE "leads" IS 'Leads coletados via web scraping ou outras fontes';
COMMENT ON TABLE "searches" IS 'Histórico de buscas realizadas no Google Maps';
COMMENT ON TABLE "raw_leads" IS 'Dados brutos coletados antes do enriquecimento';
COMMENT ON TABLE "enriched_data" IS 'Dados enriquecidos com informações adicionais';

-- Show completion message
SELECT 'LeadsRapido Database Schema created successfully!' as status;