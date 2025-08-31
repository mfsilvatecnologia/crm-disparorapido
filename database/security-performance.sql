-- Security and Performance Optimization for LeadsRapido CRM
-- Advanced PostgreSQL configuration and optimization

-- ============================================================================
-- SECURITY CONFIGURATIONS
-- ============================================================================

-- Create dedicated database roles for different access levels
CREATE ROLE leadsrapido_admin WITH LOGIN PASSWORD 'change_this_password_in_production';
CREATE ROLE leadsrapido_app WITH LOGIN PASSWORD 'change_this_password_in_production';
CREATE ROLE leadsrapido_readonly WITH LOGIN PASSWORD 'change_this_password_in_production';
CREATE ROLE leadsrapido_analytics WITH LOGIN PASSWORD 'change_this_password_in_production';

-- Grant appropriate permissions to each role
-- Admin role: Full access
GRANT ALL PRIVILEGES ON DATABASE leadsrapido TO leadsrapido_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO leadsrapido_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO leadsrapido_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO leadsrapido_admin;

-- Application role: CRUD operations on application tables
GRANT CONNECT ON DATABASE leadsrapido TO leadsrapido_app;
GRANT USAGE ON SCHEMA public TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE organizations TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE lead_segments TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE leads TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE lead_accesses TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pipeline_stages TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pipeline_leads TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE activities TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE api_keys TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE webhooks TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE daily_usage_stats TO leadsrapido_app;
GRANT SELECT, INSERT ON TABLE audit_logs TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE refresh_tokens TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE password_reset_tokens TO leadsrapido_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE email_verification_tokens TO leadsrapido_app;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO leadsrapido_app;

-- Readonly role: Read access only
GRANT CONNECT ON DATABASE leadsrapido TO leadsrapido_readonly;
GRANT USAGE ON SCHEMA public TO leadsrapido_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO leadsrapido_readonly;

-- Analytics role: Read access + analytical functions
GRANT CONNECT ON DATABASE leadsrapido TO leadsrapido_analytics;
GRANT USAGE ON SCHEMA public TO leadsrapido_analytics;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO leadsrapido_analytics;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO leadsrapido_analytics;

-- Security function to mask sensitive data for non-admin users
CREATE OR REPLACE FUNCTION mask_sensitive_data(
    p_user_role TEXT,
    p_data TEXT
)
RETURNS TEXT AS $$
BEGIN
    -- Only admin and org_admin can see full sensitive data
    IF p_user_role IN ('admin', 'org_admin') THEN
        RETURN p_data;
    ELSE
        -- Mask email and phone for other roles
        IF p_data ~ '^[^@]+@[^@]+\.[^@]+$' THEN
            -- Email masking
            RETURN substring(p_data from 1 for 2) || '***@' || split_part(p_data, '@', 2);
        ELSIF p_data ~ '^\+?[\d\s\-\(\)]+$' THEN
            -- Phone masking
            RETURN substring(p_data from 1 for 3) || '****' || substring(p_data from length(p_data) - 3);
        ELSE
            RETURN p_data;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to audit sensitive data access
CREATE OR REPLACE FUNCTION audit_sensitive_access(
    p_table_name TEXT,
    p_record_id UUID,
    p_accessed_fields TEXT[]
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        metadata
    ) VALUES (
        NULLIF(current_setting('app.current_organization_id', true), '')::UUID,
        NULLIF(current_setting('app.current_user_id', true), '')::UUID,
        'ACCESS',
        p_table_name,
        p_record_id,
        jsonb_build_object(
            'accessed_fields', p_accessed_fields,
            'access_time', CURRENT_TIMESTAMP,
            'ip_address', NULLIF(current_setting('app.client_ip', true), '')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Advanced indexing strategies for high-performance queries

-- Partial indexes for active records only
CREATE INDEX CONCURRENTLY idx_organizations_active 
ON organizations(id, name, plan) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_users_active_by_org 
ON users(organization_id, role, email) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_leads_available 
ON leads(organization_id, segment_id, quality_score DESC) 
WHERE is_accessed = false;

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_leads_search_composite 
ON leads(organization_id, quality_score DESC, created_at DESC) 
INCLUDE (name, email, company);

CREATE INDEX CONCURRENTLY idx_lead_accesses_billing 
ON lead_accesses(organization_id, billing_period, accessed_at) 
INCLUDE (cost, user_id);

-- Function-based indexes for case-insensitive searches
CREATE INDEX CONCURRENTLY idx_leads_name_lower 
ON leads(organization_id, LOWER(name)) 
WHERE name IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_leads_company_lower 
ON leads(organization_id, LOWER(company)) 
WHERE company IS NOT NULL;

-- GIN indexes for array and JSONB operations
CREATE INDEX CONCURRENTLY idx_leads_tags_gin 
ON leads USING GIN(tags) 
WHERE array_length(tags, 1) > 0;

CREATE INDEX CONCURRENTLY idx_leads_custom_fields_gin 
ON leads USING GIN(custom_fields);

-- BRIN indexes for time-series data (more space-efficient)
CREATE INDEX CONCURRENTLY idx_audit_logs_created_brin 
ON audit_logs USING BRIN(created_at);

CREATE INDEX CONCURRENTLY idx_daily_usage_stats_date_brin 
ON daily_usage_stats USING BRIN(date);

-- ============================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- ============================================================================

-- Optimized lead search function with proper indexing
CREATE OR REPLACE FUNCTION optimized_lead_search(
    p_organization_id UUID,
    p_search_term TEXT DEFAULT NULL,
    p_filters JSONB DEFAULT '{}',
    p_sort_by TEXT DEFAULT 'quality_score',
    p_sort_order TEXT DEFAULT 'DESC',
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    company VARCHAR,
    position VARCHAR,
    segment_name VARCHAR,
    quality_score INTEGER,
    is_accessed BOOLEAN,
    created_at TIMESTAMPTZ,
    relevance_score REAL
) AS $$
DECLARE
    query_text TEXT;
    where_conditions TEXT[] := ARRAY[]::TEXT[];
    order_clause TEXT;
BEGIN
    -- Build WHERE conditions based on filters
    where_conditions := array_append(where_conditions, 
                                   format('l.organization_id = %L', p_organization_id));
    
    -- Full-text search condition
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        where_conditions := array_append(where_conditions,
            format('l.search_vector @@ plainto_tsquery(''portuguese'', %L)', p_search_term));
    END IF;
    
    -- Filter conditions from JSONB
    IF p_filters ? 'segment_id' THEN
        where_conditions := array_append(where_conditions,
            format('l.segment_id = %L', (p_filters->>'segment_id')::UUID));
    END IF;
    
    IF p_filters ? 'quality_min' THEN
        where_conditions := array_append(where_conditions,
            format('l.quality_score >= %s', (p_filters->>'quality_min')::INTEGER));
    END IF;
    
    IF p_filters ? 'quality_max' THEN
        where_conditions := array_append(where_conditions,
            format('l.quality_score <= %s', (p_filters->>'quality_max')::INTEGER));
    END IF;
    
    IF p_filters ? 'is_accessed' THEN
        where_conditions := array_append(where_conditions,
            format('l.is_accessed = %L', (p_filters->>'is_accessed')::BOOLEAN));
    END IF;
    
    IF p_filters ? 'state' THEN
        where_conditions := array_append(where_conditions,
            format('l.address_state = %L', p_filters->>'state'));
    END IF;
    
    IF p_filters ? 'tags' THEN
        where_conditions := array_append(where_conditions,
            format('l.tags && %L', (p_filters->>'tags')::TEXT[]));
    END IF;
    
    -- Build ORDER BY clause
    order_clause := CASE 
        WHEN p_search_term IS NOT NULL AND p_search_term != '' THEN
            format('ts_rank(l.search_vector, plainto_tsquery(''portuguese'', %L)) DESC, ', p_search_term)
        ELSE ''
    END || format('%s %s', p_sort_by, p_sort_order);
    
    -- Build complete query
    query_text := format('
        SELECT 
            l.id,
            l.name,
            l.email,
            l.phone,
            l.company,
            l.position,
            ls.name as segment_name,
            l.quality_score,
            l.is_accessed,
            l.created_at,
            CASE 
                WHEN %L IS NOT NULL THEN 
                    ts_rank(l.search_vector, plainto_tsquery(''portuguese'', %L))
                ELSE 0.0
            END as relevance_score
        FROM leads l
        JOIN lead_segments ls ON l.segment_id = ls.id
        WHERE %s
        ORDER BY %s
        LIMIT %s OFFSET %s',
        p_search_term, p_search_term,
        array_to_string(where_conditions, ' AND '),
        order_clause,
        p_limit, p_offset
    );
    
    -- Log query for performance monitoring
    IF current_setting('app.log_queries', true)::BOOLEAN THEN
        INSERT INTO audit_logs (
            organization_id,
            action,
            resource_type,
            metadata
        ) VALUES (
            p_organization_id,
            'ACCESS',
            'lead_search',
            jsonb_build_object(
                'search_term', p_search_term,
                'filters', p_filters,
                'limit', p_limit,
                'offset', p_offset
            )
        );
    END IF;
    
    -- Execute query
    RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;

-- Function for efficient lead analytics
CREATE OR REPLACE FUNCTION get_lead_analytics(
    p_organization_id UUID,
    p_date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_date_to DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    quality_distribution JSONB;
    geographic_distribution JSONB;
    source_distribution JSONB;
    daily_trends JSONB;
BEGIN
    -- Quality score distribution
    SELECT jsonb_agg(
        jsonb_build_object(
            'quality_tier', quality_tier,
            'count', lead_count,
            'percentage', percentage
        )
    ) INTO quality_distribution
    FROM (
        SELECT 
            CASE 
                WHEN quality_score >= 90 THEN 'excellent'
                WHEN quality_score >= 80 THEN 'good'
                WHEN quality_score >= 70 THEN 'fair'
                ELSE 'poor'
            END as quality_tier,
            COUNT(*) as lead_count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
        FROM leads
        WHERE organization_id = p_organization_id
        AND created_at::DATE BETWEEN p_date_from AND p_date_to
        GROUP BY quality_tier
    ) q;
    
    -- Geographic distribution
    SELECT jsonb_agg(
        jsonb_build_object(
            'state', address_state,
            'count', lead_count,
            'avg_quality', avg_quality_score
        )
    ) INTO geographic_distribution
    FROM (
        SELECT 
            address_state,
            COUNT(*) as lead_count,
            ROUND(AVG(quality_score), 2) as avg_quality_score
        FROM leads
        WHERE organization_id = p_organization_id
        AND created_at::DATE BETWEEN p_date_from AND p_date_to
        AND address_state IS NOT NULL
        GROUP BY address_state
        ORDER BY lead_count DESC
        LIMIT 10
    ) g;
    
    -- Source distribution
    SELECT jsonb_agg(
        jsonb_build_object(
            'source', source,
            'count', lead_count,
            'avg_quality', avg_quality_score
        )
    ) INTO source_distribution
    FROM (
        SELECT 
            source,
            COUNT(*) as lead_count,
            ROUND(AVG(quality_score), 2) as avg_quality_score
        FROM leads
        WHERE organization_id = p_organization_id
        AND created_at::DATE BETWEEN p_date_from AND p_date_to
        GROUP BY source
        ORDER BY lead_count DESC
    ) s;
    
    -- Daily trends
    SELECT jsonb_agg(
        jsonb_build_object(
            'date', collection_date,
            'leads_collected', leads_collected,
            'avg_quality', avg_quality_score
        ) ORDER BY collection_date
    ) INTO daily_trends
    FROM (
        SELECT 
            created_at::DATE as collection_date,
            COUNT(*) as leads_collected,
            ROUND(AVG(quality_score), 2) as avg_quality_score
        FROM leads
        WHERE organization_id = p_organization_id
        AND created_at::DATE BETWEEN p_date_from AND p_date_to
        GROUP BY created_at::DATE
        ORDER BY collection_date
    ) d;
    
    -- Build final result
    result := jsonb_build_object(
        'period', jsonb_build_object('from', p_date_from, 'to', p_date_to),
        'quality_distribution', quality_distribution,
        'geographic_distribution', geographic_distribution,
        'source_distribution', source_distribution,
        'daily_trends', daily_trends,
        'generated_at', CURRENT_TIMESTAMP
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CONNECTION POOLING AND CACHING
-- ============================================================================

-- Function to manage connection pooling settings
CREATE OR REPLACE FUNCTION optimize_connection_settings()
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- Optimize for OLTP workload with some analytical queries
    
    -- Connection settings
    PERFORM set_config('max_connections', '200', false);
    PERFORM set_config('shared_buffers', '256MB', false);
    PERFORM set_config('effective_cache_size', '1GB', false);
    PERFORM set_config('work_mem', '4MB', false);
    PERFORM set_config('maintenance_work_mem', '64MB', false);
    
    -- Query planning settings
    PERFORM set_config('random_page_cost', '1.1', false);
    PERFORM set_config('seq_page_cost', '1.0', false);
    PERFORM set_config('cpu_tuple_cost', '0.01', false);
    PERFORM set_config('cpu_index_tuple_cost', '0.005', false);
    
    -- WAL settings for durability vs performance
    PERFORM set_config('wal_buffers', '16MB', false);
    PERFORM set_config('checkpoint_segments', '32', false);
    PERFORM set_config('checkpoint_completion_target', '0.7', false);
    
    -- Background writer settings
    PERFORM set_config('bgwriter_delay', '200ms', false);
    PERFORM set_config('bgwriter_lru_maxpages', '100', false);
    PERFORM set_config('bgwriter_lru_multiplier', '2.0', false);
    
    result := 'Database connection and performance settings optimized';
    
    INSERT INTO audit_logs (
        action,
        resource_type,
        metadata
    ) VALUES (
        'UPDATE',
        'database_optimization',
        jsonb_build_object(
            'optimization_type', 'connection_settings',
            'applied_at', CURRENT_TIMESTAMP
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTOMATED PERFORMANCE MONITORING
-- ============================================================================

-- Function to detect slow queries and suggest optimizations
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE (
    query_hash TEXT,
    query_text TEXT,
    calls BIGINT,
    total_time_ms NUMERIC,
    avg_time_ms NUMERIC,
    optimization_suggestion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        encode(digest(s.query, 'sha256'), 'hex') as query_hash,
        left(s.query, 200) as query_text,
        s.calls,
        round(s.total_time, 2) as total_time_ms,
        round(s.mean_time, 2) as avg_time_ms,
        CASE 
            WHEN s.mean_time > 1000 THEN 'Consider adding indexes or query optimization'
            WHEN s.calls > 10000 AND s.mean_time > 100 THEN 'High frequency query - consider caching'
            WHEN shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) < 0.95 THEN 'Low cache hit ratio - check buffer pool'
            ELSE 'Query performance is acceptable'
        END as optimization_suggestion
    FROM pg_stat_statements s
    WHERE s.calls > 10
    ORDER BY s.mean_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to suggest missing indexes
CREATE OR REPLACE FUNCTION suggest_missing_indexes()
RETURNS TABLE (
    table_name TEXT,
    suggested_index TEXT,
    estimated_benefit TEXT
) AS $$
BEGIN
    -- This is a simplified version - in production, you'd use more sophisticated analysis
    RETURN QUERY
    SELECT 
        'leads'::TEXT,
        'CREATE INDEX idx_leads_company_state ON leads(organization_id, company, address_state);'::TEXT,
        'For company and location-based searches'::TEXT
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_leads_company_state'
    )
    
    UNION ALL
    
    SELECT 
        'lead_accesses'::TEXT,
        'CREATE INDEX idx_lead_accesses_date_range ON lead_accesses(organization_id, accessed_at) WHERE accessed_at >= CURRENT_DATE - INTERVAL ''90 days'';'::TEXT,
        'For recent access queries'::TEXT
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_lead_accesses_date_range'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MEMORY AND STORAGE OPTIMIZATION
-- ============================================================================

-- Function to analyze table bloat and suggest maintenance
CREATE OR REPLACE FUNCTION analyze_table_bloat()
RETURNS TABLE (
    table_name TEXT,
    size_mb NUMERIC,
    bloat_percentage NUMERIC,
    maintenance_recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        round((pg_total_relation_size(t.schemaname||'.'||t.tablename) / 1024.0 / 1024.0)::NUMERIC, 2) as size_mb,
        CASE 
            WHEN s.n_live_tup > 0 THEN 
                round((s.n_dead_tup * 100.0 / s.n_live_tup)::NUMERIC, 2)
            ELSE 0
        END as bloat_percentage,
        CASE 
            WHEN s.n_dead_tup > 0 AND s.n_live_tup > 0 AND (s.n_dead_tup * 100.0 / s.n_live_tup) > 20 THEN
                'VACUUM recommended'
            WHEN s.n_dead_tup > 0 AND s.n_live_tup > 0 AND (s.n_dead_tup * 100.0 / s.n_live_tup) > 50 THEN
                'VACUUM FULL recommended'
            ELSE
                'No maintenance needed'
        END as maintenance_recommendation
    FROM pg_tables t
    JOIN pg_stat_user_tables s ON t.tablename = s.tablename
    WHERE t.schemaname = 'public'
    ORDER BY size_mb DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECURITY HARDENING
-- ============================================================================

-- Function to check security configuration
CREATE OR REPLACE FUNCTION security_audit()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    recommendation TEXT
) AS $$
BEGIN
    -- Check for default passwords
    RETURN QUERY
    SELECT 
        'Default Passwords'::TEXT,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM pg_authid 
                WHERE rolname LIKE '%leadsrapido%' 
                AND rolpassword IS NULL
            ) THEN 'FAIL'
            ELSE 'PASS'
        END::TEXT,
        'Ensure all database roles have strong passwords'::TEXT;
    
    -- Check SSL configuration
    RETURN QUERY
    SELECT 
        'SSL Configuration'::TEXT,
        CASE 
            WHEN current_setting('ssl') = 'on' THEN 'PASS'
            ELSE 'FAIL'
        END::TEXT,
        'Enable SSL for encrypted connections'::TEXT;
    
    -- Check logging configuration
    RETURN QUERY
    SELECT 
        'Query Logging'::TEXT,
        CASE 
            WHEN current_setting('log_statement') != 'none' THEN 'PASS'
            ELSE 'WARN'
        END::TEXT,
        'Consider enabling query logging for security monitoring'::TEXT;
    
    -- Check for public schema permissions
    RETURN QUERY
    SELECT 
        'Public Schema Access'::TEXT,
        CASE 
            WHEN has_schema_privilege('public', 'public', 'CREATE') THEN 'WARN'
            ELSE 'PASS'
        END::TEXT,
        'Restrict public schema CREATE permissions'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to implement row-level security policies
CREATE OR REPLACE FUNCTION implement_rls_policies()
RETURNS TEXT AS $$
DECLARE
    policy_count INTEGER := 0;
BEGIN
    -- Enable RLS on sensitive tables if not already enabled
    IF NOT (SELECT row_security FROM pg_tables WHERE tablename = 'api_keys') THEN
        ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
        policy_count := policy_count + 1;
    END IF;
    
    -- Create policy for API keys - users can only see their own organization's keys
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'api_keys_org_isolation') THEN
        CREATE POLICY api_keys_org_isolation ON api_keys
            USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);
        policy_count := policy_count + 1;
    END IF;
    
    -- Log the security policy implementation
    INSERT INTO audit_logs (
        action,
        resource_type,
        metadata
    ) VALUES (
        'CREATE',
        'security_policy',
        jsonb_build_object(
            'policies_created', policy_count,
            'implemented_at', CURRENT_TIMESTAMP
        )
    );
    
    RETURN format('Implemented %s security policies', policy_count);
END;
$$ LANGUAGE plpgsql;