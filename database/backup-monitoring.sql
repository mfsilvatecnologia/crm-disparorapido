-- Backup and Monitoring Procedures for LeadsRapido CRM
-- PostgreSQL Database Administration Scripts

-- ============================================================================
-- BACKUP PROCEDURES
-- ============================================================================

-- Function to create automated backups
CREATE OR REPLACE FUNCTION create_database_backup(
    p_backup_type VARCHAR DEFAULT 'full',
    p_retention_days INTEGER DEFAULT 30
)
RETURNS TEXT AS $$
DECLARE
    backup_name TEXT;
    backup_path TEXT;
    command TEXT;
    result TEXT;
BEGIN
    -- Generate backup filename with timestamp
    backup_name := format('leadsrapido_%s_%s.dump', 
                         p_backup_type, 
                         to_char(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS'));
    
    -- Log backup start
    INSERT INTO audit_logs (
        action,
        resource_type,
        metadata
    ) VALUES (
        'CREATE',
        'database_backup',
        jsonb_build_object(
            'backup_type', p_backup_type,
            'backup_name', backup_name,
            'started_at', CURRENT_TIMESTAMP
        )
    );
    
    RETURN backup_name;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old backups
CREATE OR REPLACE FUNCTION cleanup_old_backups(p_retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    -- This would be implemented in the backup script
    -- to remove files older than retention period
    
    INSERT INTO audit_logs (
        action,
        resource_type,
        metadata
    ) VALUES (
        'DELETE',
        'database_backup',
        jsonb_build_object(
            'retention_days', p_retention_days,
            'cleanup_at', CURRENT_TIMESTAMP
        )
    );
    
    RETURN 0; -- Placeholder
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MONITORING VIEWS AND FUNCTIONS
-- ============================================================================

-- Database health monitoring view
CREATE OR REPLACE VIEW database_health_metrics AS
SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value,
    'info' as severity
UNION ALL
SELECT 
    'Active Connections' as metric,
    COUNT(*)::text as value,
    CASE 
        WHEN COUNT(*) > 80 THEN 'critical'
        WHEN COUNT(*) > 60 THEN 'warning'
        ELSE 'info'
    END as severity
FROM pg_stat_activity
WHERE state = 'active'
UNION ALL
SELECT 
    'Longest Running Query' as metric,
    EXTRACT(EPOCH FROM MAX(CURRENT_TIMESTAMP - query_start))::INTEGER::text || ' seconds' as value,
    CASE 
        WHEN MAX(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - query_start)) > 300 THEN 'warning'
        WHEN MAX(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - query_start)) > 600 THEN 'critical'
        ELSE 'info'
    END as severity
FROM pg_stat_activity
WHERE state = 'active' AND query_start IS NOT NULL
UNION ALL
SELECT 
    'Cache Hit Ratio' as metric,
    ROUND(
        (sum(blks_hit) * 100.0 / NULLIF(sum(blks_hit) + sum(blks_read), 0)), 2
    )::text || '%' as value,
    CASE 
        WHEN ROUND(sum(blks_hit) * 100.0 / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2) < 95 THEN 'warning'
        WHEN ROUND(sum(blks_hit) * 100.0 / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2) < 90 THEN 'critical'
        ELSE 'info'
    END as severity
FROM pg_stat_database
WHERE datname = current_database();

-- Table size monitoring
CREATE OR REPLACE VIEW table_size_monitoring AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    CASE 
        WHEN n_live_tup > 0 THEN ROUND(n_dead_tup * 100.0 / n_live_tup, 2)
        ELSE 0
    END as dead_row_percentage,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
JOIN pg_tables ON pg_stat_user_tables.tablename = pg_tables.tablename
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Query performance monitoring
CREATE OR REPLACE VIEW slow_queries_monitoring AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    ROUND(total_time / calls, 2) as avg_time_ms,
    rows,
    100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) as hit_percent
FROM pg_stat_statements
WHERE calls > 100
ORDER BY mean_time DESC
LIMIT 20;

-- Connection monitoring
CREATE OR REPLACE VIEW connection_monitoring AS
SELECT 
    state,
    COUNT(*) as connection_count,
    AVG(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - state_change))::INTEGER as avg_duration_seconds
FROM pg_stat_activity
WHERE pid != pg_backend_pid()
GROUP BY state
ORDER BY connection_count DESC;

-- Organization quota monitoring
CREATE OR REPLACE VIEW quota_monitoring AS
SELECT 
    o.id,
    o.name,
    o.plan,
    o.quota_total,
    o.quota_used,
    ROUND((o.quota_used * 100.0) / NULLIF(o.quota_total, 0), 2) as quota_usage_percentage,
    o.quota_reset_date,
    EXTRACT(DAYS FROM o.quota_reset_date - CURRENT_TIMESTAMP)::INTEGER as days_until_reset,
    CASE 
        WHEN o.quota_used >= o.quota_total THEN 'critical'
        WHEN (o.quota_used * 100.0) / NULLIF(o.quota_total, 0) > 90 THEN 'warning'
        WHEN (o.quota_used * 100.0) / NULLIF(o.quota_total, 0) > 80 THEN 'info'
        ELSE 'ok'
    END as status
FROM organizations o
WHERE o.status = 'active'
ORDER BY quota_usage_percentage DESC;

-- Lead quality metrics monitoring
CREATE OR REPLACE VIEW lead_quality_monitoring AS
SELECT 
    o.name as organization_name,
    COUNT(l.id) as total_leads,
    AVG(l.quality_score) as avg_quality_score,
    COUNT(l.id) FILTER (WHERE l.quality_score >= 90) as excellent_leads,
    COUNT(l.id) FILTER (WHERE l.quality_score >= 80) as good_leads,
    COUNT(l.id) FILTER (WHERE l.quality_score >= 70) as fair_leads,
    COUNT(l.id) FILTER (WHERE l.quality_score < 70) as poor_leads,
    COUNT(l.id) FILTER (WHERE l.is_accessed) as accessed_leads,
    ROUND(
        COUNT(l.id) FILTER (WHERE l.is_accessed) * 100.0 / NULLIF(COUNT(l.id), 0), 2
    ) as access_rate_percentage
FROM organizations o
JOIN leads l ON o.id = l.organization_id
WHERE o.status = 'active'
GROUP BY o.id, o.name
ORDER BY total_leads DESC;

-- Daily usage trends
CREATE OR REPLACE VIEW daily_usage_trends AS
SELECT 
    date,
    SUM(leads_collected) as total_leads_collected,
    SUM(leads_accessed) as total_leads_accessed,
    SUM(api_requests) as total_api_requests,
    SUM(unique_users) as total_unique_users,
    AVG(avg_quality_score) as avg_quality_score,
    SUM(total_access_cost) as total_revenue
FROM daily_usage_stats
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;

-- ============================================================================
-- ALERTING FUNCTIONS
-- ============================================================================

-- Function to check database health and send alerts
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE (
    alert_type VARCHAR,
    severity VARCHAR,
    message TEXT,
    metric_value TEXT
) AS $$
BEGIN
    -- Check connection count
    IF (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') > 80 THEN
        RETURN QUERY SELECT 
            'high_connections'::VARCHAR,
            'critical'::VARCHAR,
            'High number of active connections detected'::TEXT,
            (SELECT COUNT(*)::TEXT FROM pg_stat_activity WHERE state = 'active');
    END IF;
    
    -- Check cache hit ratio
    IF (SELECT ROUND(sum(blks_hit) * 100.0 / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2)
        FROM pg_stat_database WHERE datname = current_database()) < 90 THEN
        RETURN QUERY SELECT 
            'low_cache_hit_ratio'::VARCHAR,
            'warning'::VARCHAR,
            'Cache hit ratio is below optimal threshold'::TEXT,
            (SELECT ROUND(sum(blks_hit) * 100.0 / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2)::TEXT || '%'
             FROM pg_stat_database WHERE datname = current_database());
    END IF;
    
    -- Check for long running queries
    IF (SELECT MAX(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - query_start))
        FROM pg_stat_activity 
        WHERE state = 'active' AND query_start IS NOT NULL) > 600 THEN
        RETURN QUERY SELECT 
            'long_running_query'::VARCHAR,
            'warning'::VARCHAR,
            'Long running query detected'::TEXT,
            (SELECT MAX(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - query_start))::INTEGER::TEXT || ' seconds'
             FROM pg_stat_activity WHERE state = 'active' AND query_start IS NOT NULL);
    END IF;
    
    -- Check quota usage
    FOR alert_type, severity, message, metric_value IN
        SELECT 
            'quota_usage'::VARCHAR,
            qm.status::VARCHAR,
            format('Organization %s quota usage: %s%%', qm.name, qm.quota_usage_percentage)::TEXT,
            qm.quota_usage_percentage::TEXT || '%'
        FROM quota_monitoring qm
        WHERE qm.status IN ('warning', 'critical')
    LOOP
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check lead data quality
CREATE OR REPLACE FUNCTION check_lead_data_quality()
RETURNS TABLE (
    organization_name VARCHAR,
    issue_type VARCHAR,
    severity VARCHAR,
    count INTEGER,
    percentage DECIMAL
) AS $$
BEGIN
    -- Check for leads without email
    RETURN QUERY
    SELECT 
        o.name::VARCHAR,
        'missing_email'::VARCHAR,
        'warning'::VARCHAR,
        COUNT(l.id)::INTEGER,
        ROUND(COUNT(l.id) * 100.0 / NULLIF(COUNT(*) OVER (PARTITION BY o.id), 0), 2)
    FROM organizations o
    JOIN leads l ON o.id = l.organization_id
    WHERE l.email IS NULL
    GROUP BY o.id, o.name
    HAVING COUNT(l.id) > 10;
    
    -- Check for low quality leads
    RETURN QUERY
    SELECT 
        o.name::VARCHAR,
        'low_quality_leads'::VARCHAR,
        'info'::VARCHAR,
        COUNT(l.id)::INTEGER,
        ROUND(COUNT(l.id) * 100.0 / NULLIF(COUNT(*) OVER (PARTITION BY o.id), 0), 2)
    FROM organizations o
    JOIN leads l ON o.id = l.organization_id
    WHERE l.quality_score < 50
    GROUP BY o.id, o.name
    HAVING COUNT(l.id) > 50;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MAINTENANCE PROCEDURES
-- ============================================================================

-- Function to perform routine maintenance
CREATE OR REPLACE FUNCTION perform_routine_maintenance()
RETURNS TEXT AS $$
DECLARE
    maintenance_log TEXT[];
    table_record RECORD;
    result TEXT;
BEGIN
    maintenance_log := ARRAY[]::TEXT[];
    
    -- Vacuum and analyze critical tables
    FOR table_record IN
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('leads', 'lead_accesses', 'organizations', 'audit_logs')
    LOOP
        -- Check if vacuum is needed (more than 20% dead rows)
        IF (SELECT COALESCE(n_dead_tup * 100.0 / NULLIF(n_live_tup, 0), 0)
            FROM pg_stat_user_tables 
            WHERE tablename = table_record.tablename) > 20 THEN
            
            EXECUTE format('VACUUM ANALYZE %I', table_record.tablename);
            maintenance_log := array_append(maintenance_log, 
                                          format('Vacuumed table: %s', table_record.tablename));
        END IF;
    END LOOP;
    
    -- Update table statistics
    ANALYZE;
    maintenance_log := array_append(maintenance_log, 'Updated table statistics');
    
    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lead_quality_distribution;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lead_geographic_distribution;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_org_metrics;
    maintenance_log := array_append(maintenance_log, 'Refreshed materialized views');
    
    -- Clean up old audit logs (older than 2 years)
    result := cleanup_old_audit_logs();
    maintenance_log := array_append(maintenance_log, 
                                  format('Cleaned up %s old audit log entries', result));
    
    -- Reset quota for organizations past reset date
    result := reset_monthly_quotas();
    maintenance_log := array_append(maintenance_log, 
                                  format('Reset quotas for %s organizations', result));
    
    -- Log maintenance completion
    INSERT INTO audit_logs (
        action,
        resource_type,
        metadata
    ) VALUES (
        'UPDATE',
        'database_maintenance',
        jsonb_build_object(
            'maintenance_tasks', maintenance_log,
            'completed_at', CURRENT_TIMESTAMP
        )
    );
    
    RETURN array_to_string(maintenance_log, E'\n');
END;
$$ LANGUAGE plpgsql;

-- Function to generate daily health report
CREATE OR REPLACE FUNCTION generate_daily_health_report()
RETURNS JSONB AS $$
DECLARE
    report JSONB;
    health_metrics JSONB;
    quota_status JSONB;
    performance_metrics JSONB;
BEGIN
    -- Collect health metrics
    SELECT jsonb_agg(
        jsonb_build_object(
            'metric', metric,
            'value', value,
            'severity', severity
        )
    ) INTO health_metrics
    FROM database_health_metrics;
    
    -- Collect quota status
    SELECT jsonb_agg(
        jsonb_build_object(
            'organization', name,
            'usage_percentage', quota_usage_percentage,
            'status', status,
            'days_until_reset', days_until_reset
        )
    ) INTO quota_status
    FROM quota_monitoring
    WHERE status != 'ok';
    
    -- Collect performance metrics
    SELECT jsonb_build_object(
        'avg_query_time', COALESCE(AVG(mean_time), 0),
        'slow_queries_count', COUNT(*),
        'total_calls', SUM(calls)
    ) INTO performance_metrics
    FROM slow_queries_monitoring;
    
    -- Build final report
    report := jsonb_build_object(
        'report_date', CURRENT_DATE,
        'generated_at', CURRENT_TIMESTAMP,
        'health_metrics', health_metrics,
        'quota_alerts', quota_status,
        'performance_summary', performance_metrics,
        'database_size', pg_size_pretty(pg_database_size(current_database())),
        'active_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active')
    );
    
    -- Store report in audit logs
    INSERT INTO audit_logs (
        action,
        resource_type,
        metadata
    ) VALUES (
        'CREATE',
        'health_report',
        report
    );
    
    RETURN report;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTOMATED JOBS SETUP
-- ============================================================================

-- Note: These would typically be set up as cron jobs or using pg_cron extension

-- Daily maintenance job (runs at 2 AM)
-- 0 2 * * * SELECT perform_routine_maintenance();

-- Daily health report (runs at 8 AM)
-- 0 8 * * * SELECT generate_daily_health_report();

-- Hourly health check (runs every hour)
-- 0 * * * * SELECT * FROM check_database_health();

-- Weekly backup cleanup (runs Sunday at 3 AM)
-- 0 3 * * 0 SELECT cleanup_old_backups(30);

-- ============================================================================
-- DISASTER RECOVERY PROCEDURES
-- ============================================================================

-- Function to create point-in-time recovery information
CREATE OR REPLACE FUNCTION create_recovery_point(p_description TEXT)
RETURNS TEXT AS $$
DECLARE
    recovery_point TEXT;
    wal_position TEXT;
BEGIN
    -- Get current WAL position
    SELECT pg_current_wal_lsn()::TEXT INTO wal_position;
    
    -- Create recovery point identifier
    recovery_point := format('recovery_point_%s_%s', 
                            to_char(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS'),
                            encode(digest(p_description, 'sha256'), 'hex'));
    
    -- Log recovery point
    INSERT INTO audit_logs (
        action,
        resource_type,
        metadata
    ) VALUES (
        'CREATE',
        'recovery_point',
        jsonb_build_object(
            'recovery_point_id', recovery_point,
            'description', p_description,
            'wal_position', wal_position,
            'created_at', CURRENT_TIMESTAMP
        )
    );
    
    RETURN recovery_point;
END;
$$ LANGUAGE plpgsql;

-- Function to validate data integrity
CREATE OR REPLACE FUNCTION validate_data_integrity()
RETURNS TABLE (
    check_name VARCHAR,
    status VARCHAR,
    details TEXT
) AS $$
BEGIN
    -- Check foreign key constraints
    RETURN QUERY
    SELECT 
        'foreign_key_constraints'::VARCHAR,
        'passed'::VARCHAR,
        'All foreign key constraints are valid'::TEXT
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY'
        AND constraint_name NOT IN (
            SELECT constraint_name FROM information_schema.referential_constraints
        )
    );
    
    -- Check for orphaned records
    RETURN QUERY
    SELECT 
        'orphaned_leads'::VARCHAR,
        CASE WHEN COUNT(*) = 0 THEN 'passed' ELSE 'failed' END::VARCHAR,
        format('%s orphaned lead records found', COUNT(*))::TEXT
    FROM leads l
    LEFT JOIN organizations o ON l.organization_id = o.id
    WHERE o.id IS NULL;
    
    -- Check quota consistency
    RETURN QUERY
    SELECT 
        'quota_consistency'::VARCHAR,
        CASE WHEN COUNT(*) = 0 THEN 'passed' ELSE 'failed' END::VARCHAR,
        format('%s organizations with quota inconsistencies', COUNT(*))::TEXT
    FROM organizations o
    WHERE o.quota_used > o.quota_total
    OR o.quota_used < 0;
END;
$$ LANGUAGE plpgsql;

-- View for monitoring backup status
CREATE OR REPLACE VIEW backup_monitoring AS
SELECT 
    (metadata->>'backup_name')::TEXT as backup_name,
    (metadata->>'backup_type')::TEXT as backup_type,
    created_at as backup_time,
    EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - created_at)::INTEGER as age_seconds
FROM audit_logs
WHERE resource_type = 'database_backup'
AND action = 'CREATE'
ORDER BY created_at DESC
LIMIT 10;