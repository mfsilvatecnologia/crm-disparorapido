-- LeadsRapido Database Schema
-- Multi-tenant CRM system for lead generation
-- PostgreSQL 15+ optimized

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For multi-column indexes
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geographic data (if needed)

-- Custom types and enums
CREATE TYPE user_role_enum AS ENUM ('admin', 'org_admin', 'agent', 'viewer');
CREATE TYPE organization_plan_enum AS ENUM ('basic', 'professional', 'enterprise', 'white_label');
CREATE TYPE activity_type_enum AS ENUM ('call', 'email', 'meeting', 'note');
CREATE TYPE lead_source_enum AS ENUM ('linkedin-scraping', 'web-scraping', 'crunchbase-api', 'manual-import', 'api-integration');
CREATE TYPE audit_action_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ACCESS', 'EXPORT');

-- Organizations table (root entity for multi-tenancy)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE, -- Brazilian tax ID
    subdomain VARCHAR(63) UNIQUE, -- For white-label domains
    plan organization_plan_enum NOT NULL DEFAULT 'basic',
    
    -- Quota management
    quota_total INTEGER NOT NULL DEFAULT 1000,
    quota_used INTEGER NOT NULL DEFAULT 0,
    quota_reset_date TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month'),
    
    -- Billing information
    billing_email VARCHAR(255),
    billing_address JSONB,
    stripe_customer_id VARCHAR(255),
    
    -- Settings (JSONB for flexibility)
    settings JSONB DEFAULT '{}',
    
    -- Status and timestamps
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_quota CHECK (quota_used <= quota_total AND quota_used >= 0)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'agent',
    avatar_url VARCHAR(512),
    
    -- Account management
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Multi-tenant constraint: email unique per organization
    UNIQUE(organization_id, email)
);

-- Lead segments table
CREATE TABLE lead_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, name)
);

-- Leads table (partitioned by organization_id for performance)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Personal information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(255),
    website VARCHAR(512),
    linkedin_url VARCHAR(512),
    
    -- Address information (structured for geographic queries)
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip_code VARCHAR(20),
    address_country VARCHAR(50) DEFAULT 'Brasil',
    address_coordinates POINT, -- PostGIS point for location-based searches
    
    -- Segmentation and quality
    segment_id UUID NOT NULL REFERENCES lead_segments(id),
    quality_score INTEGER NOT NULL DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    tags TEXT[] DEFAULT '{}', -- Array of tags for flexible categorization
    
    -- Custom fields (JSONB for flexibility)
    custom_fields JSONB DEFAULT '{}',
    
    -- Data collection metadata
    source lead_source_enum NOT NULL,
    collected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_enriched_at TIMESTAMPTZ,
    data_confidence DECIMAL(3,2) DEFAULT 0.50 CHECK (data_confidence >= 0 AND data_confidence <= 1),
    
    -- Access control and pricing
    access_cost DECIMAL(10,2) NOT NULL DEFAULT 2.50,
    is_accessed BOOLEAN NOT NULL DEFAULT false,
    accessed_at TIMESTAMPTZ,
    accessed_by_user_id UUID REFERENCES users(id),
    
    -- Duplicate detection
    duplicate_hash VARCHAR(64), -- SHA-256 hash for duplicate detection
    
    -- Full-text search vector
    search_vector tsvector,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY HASH (organization_id);

-- Create partitions for leads table (16 partitions for better distribution)
DO $$
BEGIN
    FOR i IN 0..15 LOOP
        EXECUTE format('CREATE TABLE leads_part_%s PARTITION OF leads FOR VALUES WITH (modulus 16, remainder %s)', i, i);
    END LOOP;
END $$;

-- Lead access history (for audit and billing)
CREATE TABLE lead_accesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    cost DECIMAL(10,2) NOT NULL,
    billing_period VARCHAR(7) NOT NULL, -- YYYY-MM format
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to leads table (across partitions)
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Pipeline stages table
CREATE TABLE pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    stage_order INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, stage_order),
    UNIQUE(organization_id, name)
);

-- Pipeline leads table
CREATE TABLE pipeline_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL,
    stage_id UUID NOT NULL REFERENCES pipeline_stages(id),
    assigned_user_id UUID REFERENCES users(id),
    
    -- Deal information
    estimated_value DECIMAL(12,2),
    probability DECIMAL(3,2) DEFAULT 0.00 CHECK (probability >= 0 AND probability <= 1),
    close_date DATE,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one lead per organization in pipeline
    UNIQUE(organization_id, lead_id),
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Activities table (calls, emails, meetings, notes)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pipeline_lead_id UUID NOT NULL REFERENCES pipeline_leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    type activity_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(10) NOT NULL, -- First 8 chars for identification
    permissions TEXT[] DEFAULT '{}',
    
    -- Usage tracking
    last_used_at TIMESTAMPTZ,
    usage_count BIGINT DEFAULT 0,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    
    -- Expiration
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks configuration
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    url VARCHAR(512) NOT NULL,
    events TEXT[] NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    
    -- Status and reliability
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    
    -- Rate limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Usage analytics table (daily aggregations)
CREATE TABLE daily_usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Usage metrics
    leads_collected INTEGER DEFAULT 0,
    leads_accessed INTEGER DEFAULT 0,
    api_requests INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    
    -- Quality metrics
    avg_quality_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Financial metrics
    total_access_cost DECIMAL(12,2) DEFAULT 0.00,
    
    -- Performance metrics
    avg_response_time_ms INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, date)
);

-- Audit log table for compliance and security
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action details
    action audit_action_enum NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    resource_data JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for audit_logs (performance optimization)
DO $$
DECLARE
    start_date DATE := DATE_TRUNC('month', CURRENT_DATE);
    end_date DATE;
    i INTEGER;
BEGIN
    FOR i IN 0..11 LOOP
        end_date := start_date + INTERVAL '1 month';
        EXECUTE format('CREATE TABLE audit_logs_%s PARTITION OF audit_logs FOR VALUES FROM (%L) TO (%L)',
            TO_CHAR(start_date, 'YYYY_MM'), start_date, end_date);
        start_date := end_date;
    END LOOP;
END $$;

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Track token usage
    last_used_at TIMESTAMPTZ,
    is_revoked BOOLEAN NOT NULL DEFAULT false
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Organizations indexes
CREATE INDEX idx_organizations_plan ON organizations(plan);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_subdomain ON organizations(subdomain) WHERE subdomain IS NOT NULL;

-- Users indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Lead segments indexes
CREATE INDEX idx_lead_segments_organization_id ON lead_segments(organization_id);

-- Leads indexes (applied to all partitions)
CREATE INDEX idx_leads_organization_id ON leads(organization_id);
CREATE INDEX idx_leads_segment_id ON leads(segment_id);
CREATE INDEX idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX idx_leads_company ON leads(company) WHERE company IS NOT NULL;
CREATE INDEX idx_leads_quality_score ON leads(quality_score);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_is_accessed ON leads(is_accessed);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_duplicate_hash ON leads(duplicate_hash) WHERE duplicate_hash IS NOT NULL;

-- Geographic index for location-based searches
CREATE INDEX idx_leads_coordinates ON leads USING GIST(address_coordinates) WHERE address_coordinates IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_leads_search_vector ON leads USING GIN(search_vector);

-- Composite indexes for common queries
CREATE INDEX idx_leads_org_quality ON leads(organization_id, quality_score DESC);
CREATE INDEX idx_leads_org_created ON leads(organization_id, created_at DESC);
CREATE INDEX idx_leads_org_accessed ON leads(organization_id, is_accessed, created_at DESC);

-- Lead accesses indexes
CREATE INDEX idx_lead_accesses_organization_id ON lead_accesses(organization_id);
CREATE INDEX idx_lead_accesses_lead_id ON lead_accesses(lead_id);
CREATE INDEX idx_lead_accesses_user_id ON lead_accesses(user_id);
CREATE INDEX idx_lead_accesses_billing_period ON lead_accesses(billing_period);
CREATE INDEX idx_lead_accesses_accessed_at ON lead_accesses(accessed_at);

-- Pipeline indexes
CREATE INDEX idx_pipeline_stages_organization_id ON pipeline_stages(organization_id);
CREATE INDEX idx_pipeline_stages_order ON pipeline_stages(organization_id, stage_order);

CREATE INDEX idx_pipeline_leads_organization_id ON pipeline_leads(organization_id);
CREATE INDEX idx_pipeline_leads_stage_id ON pipeline_leads(stage_id);
CREATE INDEX idx_pipeline_leads_assigned_user ON pipeline_leads(assigned_user_id) WHERE assigned_user_id IS NOT NULL;
CREATE INDEX idx_pipeline_leads_close_date ON pipeline_leads(close_date) WHERE close_date IS NOT NULL;

-- Activities indexes
CREATE INDEX idx_activities_organization_id ON activities(organization_id);
CREATE INDEX idx_activities_pipeline_lead_id ON activities(pipeline_lead_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- API keys indexes
CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- Usage stats indexes
CREATE INDEX idx_daily_usage_stats_organization_date ON daily_usage_stats(organization_id, date DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Authentication token indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_timestamp_organizations
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_lead_segments
    BEFORE UPDATE ON lead_segments
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_leads
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_pipeline_stages
    BEFORE UPDATE ON pipeline_stages
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_pipeline_leads
    BEFORE UPDATE ON pipeline_leads
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_activities
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_api_keys
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_webhooks
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- Function to update search vector for leads
CREATE OR REPLACE FUNCTION update_lead_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('portuguese', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.company, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.email, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.position, '')), 'B') ||
        setweight(to_tsvector('portuguese', array_to_string(NEW.tags, ' ')), 'C') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.address_city, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply search vector trigger to leads
CREATE TRIGGER update_leads_search_vector
    BEFORE INSERT OR UPDATE ON leads
    FOR EACH ROW
    EXECUTE PROCEDURE update_lead_search_vector();

-- Function to generate duplicate hash for leads
CREATE OR REPLACE FUNCTION generate_lead_duplicate_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.duplicate_hash := encode(
        digest(
            LOWER(TRIM(COALESCE(NEW.email, ''))) || '|' ||
            LOWER(TRIM(COALESCE(NEW.name, ''))) || '|' ||
            LOWER(TRIM(COALESCE(NEW.company, ''))),
            'sha256'
        ),
        'hex'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply duplicate hash trigger to leads
CREATE TRIGGER generate_leads_duplicate_hash
    BEFORE INSERT OR UPDATE ON leads
    FOR EACH ROW
    EXECUTE PROCEDURE generate_lead_duplicate_hash();

-- Function to update organization quota
CREATE OR REPLACE FUNCTION update_organization_quota()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment quota on lead access
    IF TG_OP = 'INSERT' THEN
        UPDATE organizations 
        SET quota_used = quota_used + 1
        WHERE id = NEW.organization_id;
        RETURN NEW;
    END IF;
    
    -- Decrement quota on access deletion (refund)
    IF TG_OP = 'DELETE' THEN
        UPDATE organizations 
        SET quota_used = GREATEST(quota_used - 1, 0)
        WHERE id = OLD.organization_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply quota trigger to lead accesses
CREATE TRIGGER update_quota_on_access
    AFTER INSERT OR DELETE ON lead_accesses
    FOR EACH ROW
    EXECUTE PROCEDURE update_organization_quota();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    organization_id_value UUID;
    user_id_value UUID;
    action_value audit_action_enum;
BEGIN
    -- Determine the action
    IF TG_OP = 'INSERT' THEN
        action_value := 'CREATE';
        organization_id_value := NEW.organization_id;
    ELSIF TG_OP = 'UPDATE' THEN
        action_value := 'UPDATE';
        organization_id_value := NEW.organization_id;
    ELSIF TG_OP = 'DELETE' THEN
        action_value := 'DELETE';
        organization_id_value := OLD.organization_id;
    END IF;

    -- Extract user_id from session if available
    user_id_value := NULLIF(current_setting('app.current_user_id', true), '')::UUID;

    -- Insert audit log entry
    INSERT INTO audit_logs (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        resource_data,
        ip_address,
        metadata
    ) VALUES (
        organization_id_value,
        user_id_value,
        action_value,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id 
            ELSE NEW.id 
        END,
        CASE 
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) 
            ELSE to_jsonb(NEW) 
        END,
        NULLIF(current_setting('app.client_ip', true), '')::INET,
        jsonb_build_object('operation', TG_OP)
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW
    EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_leads
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW
    EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_lead_accesses
    AFTER INSERT OR DELETE ON lead_accesses
    FOR EACH ROW
    EXECUTE PROCEDURE create_audit_log();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) for Multi-tenancy
-- ============================================================================

-- Enable RLS on all tenant-specific tables
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

-- Organization policies (admin can see all, users see their own)
CREATE POLICY organization_isolation ON organizations
    USING (
        id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
        OR current_setting('app.current_user_role', true) = 'admin'
    );

-- User policies
CREATE POLICY user_organization_isolation ON users
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
        OR current_setting('app.current_user_role', true) = 'admin'
    );

-- Lead segments policies
CREATE POLICY lead_segments_organization_isolation ON lead_segments
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
    );

-- Leads policies
CREATE POLICY leads_organization_isolation ON leads
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
    );

-- Lead accesses policies
CREATE POLICY lead_accesses_organization_isolation ON lead_accesses
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
    );

-- Pipeline policies
CREATE POLICY pipeline_stages_organization_isolation ON pipeline_stages
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
    );

CREATE POLICY pipeline_leads_organization_isolation ON pipeline_leads
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
    );

-- Activities policies
CREATE POLICY activities_organization_isolation ON activities
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
    );

-- API keys policies
CREATE POLICY api_keys_organization_isolation ON api_keys
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
    );

-- Webhooks policies
CREATE POLICY webhooks_organization_isolation ON webhooks
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
    );

-- Usage stats policies
CREATE POLICY usage_stats_organization_isolation ON daily_usage_stats
    USING (
        organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
    );

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- Lead quality distribution by organization
CREATE MATERIALIZED VIEW mv_lead_quality_distribution AS
SELECT 
    l.organization_id,
    o.name as organization_name,
    CASE 
        WHEN l.quality_score >= 85 THEN 'high'
        WHEN l.quality_score >= 70 THEN 'medium'
        ELSE 'low'
    END as quality_tier,
    COUNT(*) as lead_count,
    AVG(l.quality_score) as avg_quality_score
FROM leads l
JOIN organizations o ON l.organization_id = o.id
GROUP BY l.organization_id, o.name, quality_tier;

-- Create index on materialized view
CREATE INDEX idx_mv_lead_quality_org ON mv_lead_quality_distribution(organization_id);

-- Lead geographic distribution
CREATE MATERIALIZED VIEW mv_lead_geographic_distribution AS
SELECT 
    l.organization_id,
    l.address_state,
    l.address_city,
    COUNT(*) as lead_count,
    AVG(l.quality_score) as avg_quality_score,
    COUNT(*) FILTER (WHERE l.is_accessed) as accessed_count
FROM leads l
WHERE l.address_state IS NOT NULL
GROUP BY l.organization_id, l.address_state, l.address_city;

-- Monthly organization metrics
CREATE MATERIALIZED VIEW mv_monthly_org_metrics AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    DATE_TRUNC('month', dus.date) as month,
    SUM(dus.leads_collected) as total_leads_collected,
    SUM(dus.leads_accessed) as total_leads_accessed,
    SUM(dus.api_requests) as total_api_requests,
    AVG(dus.avg_quality_score) as avg_quality_score,
    SUM(dus.total_access_cost) as total_revenue
FROM daily_usage_stats dus
JOIN organizations o ON dus.organization_id = o.id
GROUP BY o.id, o.name, DATE_TRUNC('month', dus.date);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lead_quality_distribution;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lead_geographic_distribution;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_org_metrics;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old audit logs (older than 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to reset organization quotas monthly
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE organizations 
    SET 
        quota_used = 0,
        quota_reset_date = CURRENT_TIMESTAMP + INTERVAL '1 month'
    WHERE quota_reset_date <= CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get lead search results with full-text search
CREATE OR REPLACE FUNCTION search_leads(
    p_organization_id UUID,
    p_search_term TEXT DEFAULT NULL,
    p_segment_id UUID DEFAULT NULL,
    p_quality_min INTEGER DEFAULT NULL,
    p_quality_max INTEGER DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_is_accessed BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    company VARCHAR,
    quality_score INTEGER,
    is_accessed BOOLEAN,
    relevance_rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.email,
        l.company,
        l.quality_score,
        l.is_accessed,
        CASE 
            WHEN p_search_term IS NOT NULL THEN 
                ts_rank(l.search_vector, plainto_tsquery('portuguese', p_search_term))
            ELSE 0.0
        END as relevance_rank
    FROM leads l
    WHERE l.organization_id = p_organization_id
        AND (p_search_term IS NULL OR l.search_vector @@ plainto_tsquery('portuguese', p_search_term))
        AND (p_segment_id IS NULL OR l.segment_id = p_segment_id)
        AND (p_quality_min IS NULL OR l.quality_score >= p_quality_min)
        AND (p_quality_max IS NULL OR l.quality_score <= p_quality_max)
        AND (p_tags IS NULL OR l.tags && p_tags)
        AND (p_is_accessed IS NULL OR l.is_accessed = p_is_accessed)
    ORDER BY 
        CASE WHEN p_search_term IS NOT NULL THEN relevance_rank ELSE 0 END DESC,
        l.quality_score DESC,
        l.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default lead segments
INSERT INTO lead_segments (id, organization_id, name, description, color) 
SELECT 
    gen_random_uuid(),
    o.id,
    'Tecnologia',
    'Empresas de tecnologia e software',
    '#3b82f6'
FROM organizations o
ON CONFLICT DO NOTHING;

-- Create indexes on materialized views
CREATE UNIQUE INDEX idx_mv_lead_quality_unique 
ON mv_lead_quality_distribution(organization_id, quality_tier);

CREATE UNIQUE INDEX idx_mv_lead_geographic_unique 
ON mv_lead_geographic_distribution(organization_id, address_state, address_city);

CREATE UNIQUE INDEX idx_mv_monthly_metrics_unique 
ON mv_monthly_org_metrics(organization_id, month);