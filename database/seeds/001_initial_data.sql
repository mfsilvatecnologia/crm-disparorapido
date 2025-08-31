-- Seed: 001_initial_data.sql
-- Description: Initial seed data for LeadsRapido CRM
-- Author: Database Administrator
-- Date: 2025-01-20

BEGIN;

-- Create initial system organization (for admin purposes)
INSERT INTO organizations (
    id, 
    name, 
    plan, 
    quota_total, 
    status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'LeadsRapido System',
    'enterprise',
    1000000,
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Create initial admin user
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    password_hash,
    role,
    is_active,
    email_verified
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'admin@leadsrapido.com',
    'System Administrator',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbVhBOTJcHzXd1W', -- password: admin123
    'admin',
    true,
    true
) ON CONFLICT (organization_id, email) DO NOTHING;

-- Create default lead segments for system organization
INSERT INTO lead_segments (id, organization_id, name, description, color) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Tecnologia', 'Empresas de tecnologia e software', '#3b82f6'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Marketing Digital', 'Agências e consultorias de marketing', '#10b981'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Fintech', 'Startups de tecnologia financeira', '#f59e0b'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'E-commerce', 'Lojas online e marketplaces', '#8b5cf6'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Saúde', 'Clínicas, hospitais e healthtechs', '#ef4444'),
    ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Educação', 'Escolas, universidades e edtechs', '#06b6d4'),
    ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Consultoria', 'Empresas de consultoria e serviços', '#84cc16'),
    ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Indústria', 'Empresas industriais e manufatura', '#f97316')
ON CONFLICT (organization_id, name) DO NOTHING;

-- Create default pipeline stages for system organization
INSERT INTO pipeline_stages (id, organization_id, name, color, stage_order) VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Novo Lead', '#64748b', 1),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Qualificação', '#3b82f6', 2),
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Proposta', '#f59e0b', 3),
    ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Negociação', '#8b5cf6', 4),
    ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Fechado (Ganho)', '#22c55e', 5),
    ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Fechado (Perdido)', '#ef4444', 6)
ON CONFLICT (organization_id, name) DO NOTHING;

-- Create demo organization
INSERT INTO organizations (
    id, 
    name, 
    cnpj,
    plan, 
    quota_total,
    quota_used,
    billing_email,
    status
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Empresa Demo LTDA',
    '12.345.678/0001-99',
    'professional',
    5000,
    150,
    'billing@empresademo.com.br',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Create demo users
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    password_hash,
    role,
    is_active,
    email_verified
) VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'admin@empresademo.com.br',
        'João Silva',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbVhBOTJcHzXd1W', -- password: demo123
        'org_admin',
        true,
        true
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'vendas@empresademo.com.br',
        'Maria Santos',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbVhBOTJcHzXd1W', -- password: demo123
        'agent',
        true,
        true
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'marketing@empresademo.com.br',
        'Pedro Costa',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbVhBOTJcHzXd1W', -- password: demo123
        'agent',
        true,
        true
    )
ON CONFLICT (organization_id, email) DO NOTHING;

-- Copy default segments to demo organization
INSERT INTO lead_segments (organization_id, name, description, color)
SELECT 
    '11111111-1111-1111-1111-111111111111',
    name,
    description,
    color
FROM lead_segments 
WHERE organization_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT (organization_id, name) DO NOTHING;

-- Copy default pipeline stages to demo organization
INSERT INTO pipeline_stages (organization_id, name, color, stage_order)
SELECT 
    '11111111-1111-1111-1111-111111111111',
    name,
    color,
    stage_order
FROM pipeline_stages 
WHERE organization_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT (organization_id, name) DO NOTHING;

-- Create sample leads for demo organization
WITH demo_segments AS (
    SELECT id, name FROM lead_segments 
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'
)
INSERT INTO leads (
    organization_id,
    name,
    email,
    phone,
    company,
    position,
    website,
    linkedin_url,
    address_street,
    address_city,
    address_state,
    address_zip_code,
    address_country,
    segment_id,
    quality_score,
    tags,
    custom_fields,
    source,
    data_confidence,
    access_cost
) VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'Ana Carolina Silva',
        'ana.silva@techstartup.com.br',
        '+55 11 99999-0001',
        'TechStartup Inovação',
        'CEO',
        'https://techstartup.com.br',
        'https://linkedin.com/in/anasilvatechceo',
        'Av. Faria Lima, 1000 - Sala 501',
        'São Paulo',
        'SP',
        '01451-000',
        'Brasil',
        (SELECT id FROM demo_segments WHERE name = 'Tecnologia'),
        95,
        ARRAY['decision-maker', 'enterprise', 'high-value', 'ai-focused'],
        '{"employees": "50-200", "revenue": "$5M-$10M", "funding_stage": "Series A", "technologies": ["React", "Python", "AWS"]}'::jsonb,
        'linkedin_scraping',
        0.95,
        2.50
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'Roberto Fernandes',
        'roberto@digitalagency.com.br',
        '+55 21 99999-0002',
        'Digital Agency Brasil',
        'Diretor de Marketing',
        'https://digitalagency.com.br',
        'https://linkedin.com/in/robertofernandes',
        'Rua das Laranjeiras, 200',
        'Rio de Janeiro',
        'RJ',
        '22240-070',
        'Brasil',
        (SELECT id FROM demo_segments WHERE name = 'Marketing Digital'),
        88,
        ARRAY['decision-maker', 'smb', 'content-marketing'],
        '{"employees": "20-50", "revenue": "$1M-$5M", "clients": 150, "focus": "B2B marketing"}'::jsonb,
        'web_scraping',
        0.88,
        2.50
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'Carla Mendes',
        'carla@fintech-brasil.com',
        '+55 11 99999-0003',
        'FinTech Brasil',
        'CTO',
        'https://fintech-brasil.com',
        'https://linkedin.com/in/carlamendestech',
        'Av. Paulista, 1500 - Conjunto 1201',
        'São Paulo',
        'SP',
        '01310-100',
        'Brasil',
        (SELECT id FROM demo_segments WHERE name = 'Fintech'),
        91,
        ARRAY['tech-leader', 'fintech', 'blockchain', 'startup'],
        '{"employees": "100-300", "revenue": "$10M+", "technologies": ["Blockchain", "Node.js", "PostgreSQL"], "funding": "Series B"}'::jsonb,
        'crunchbase_api',
        0.92,
        2.50
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'Eduardo Santos',
        'eduardo@ecommerce-plus.com.br',
        '+55 11 99999-0004',
        'E-commerce Plus',
        'Founder',
        'https://ecommerce-plus.com.br',
        NULL,
        'Rua Oscar Freire, 800',
        'São Paulo',
        'SP',
        '01426-001',
        'Brasil',
        (SELECT id FROM demo_segments WHERE name = 'E-commerce'),
        76,
        ARRAY['founder', 'e-commerce', 'growth-stage'],
        '{"employees": "30-50", "revenue": "$2M-$5M", "platforms": ["Shopify", "WooCommerce"], "gmv": "$50M+"}'::jsonb,
        'manual_import',
        0.80,
        2.50
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'Dra. Fernanda Lima',
        'fernanda@clinica-inovacao.com.br',
        '+55 11 99999-0005',
        'Clínica Inovação Médica',
        'Diretora Médica',
        'https://clinica-inovacao.com.br',
        'https://linkedin.com/in/dra-fernanda-lima',
        'Av. Rebouças, 1200',
        'São Paulo',
        'SP',
        '05402-000',
        'Brasil',
        (SELECT id FROM demo_segments WHERE name = 'Saúde'),
        83,
        ARRAY['healthcare', 'decision-maker', 'innovation'],
        '{"employees": "100-200", "specialties": ["Cardiologia", "Neurologia"], "patients": 5000, "digital_health": true}'::jsonb,
        'linkedin_scraping',
        0.85,
        2.50
    )
ON CONFLICT (duplicate_hash) DO NOTHING;

-- Create some sample lead accesses
INSERT INTO lead_accesses (
    organization_id,
    lead_id,
    user_id,
    cost,
    billing_period,
    ip_address
)
SELECT 
    '11111111-1111-1111-1111-111111111111',
    l.id,
    '11111111-1111-1111-1111-111111111111', -- Admin user
    2.50,
    TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
    '192.168.1.100'::inet
FROM leads l 
WHERE l.organization_id = '11111111-1111-1111-1111-111111111111'
AND l.name IN ('Ana Carolina Silva', 'Roberto Fernandes')
LIMIT 2;

-- Update accessed leads
UPDATE leads 
SET 
    is_accessed = true,
    accessed_at = CURRENT_TIMESTAMP,
    accessed_by_user_id = '11111111-1111-1111-1111-111111111111'
WHERE organization_id = '11111111-1111-1111-1111-111111111111'
AND name IN ('Ana Carolina Silva', 'Roberto Fernandes');

-- Create sample daily usage stats
INSERT INTO daily_usage_stats (
    organization_id,
    date,
    leads_collected,
    leads_accessed,
    api_requests,
    unique_users,
    avg_quality_score,
    total_access_cost
) VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        CURRENT_DATE - INTERVAL '30 days',
        15,
        8,
        120,
        2,
        85.50,
        20.00
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        CURRENT_DATE - INTERVAL '29 days',
        12,
        10,
        95,
        3,
        87.20,
        25.00
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        CURRENT_DATE - INTERVAL '28 days',
        20,
        15,
        180,
        3,
        82.80,
        37.50
    )
ON CONFLICT (organization_id, date) DO NOTHING;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW mv_lead_quality_distribution;
REFRESH MATERIALIZED VIEW mv_lead_geographic_distribution;
REFRESH MATERIALIZED VIEW mv_monthly_org_metrics;

-- Create API key for demo organization
INSERT INTO api_keys (
    organization_id,
    user_id,
    name,
    key_hash,
    key_prefix,
    permissions,
    rate_limit_per_hour
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Demo API Key',
    '$2b$12$demo.key.hash.for.testing.purposes.only',
    'lrk_demo_',
    ARRAY['leads:read', 'leads:write', 'analytics:read'],
    5000
);

-- Log the completion
INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'CREATE',
    'database_seed',
    '00000000-0000-0000-0000-000000000001',
    '{"message": "Initial database seeding completed", "version": "1.0.0"}'::jsonb
);

COMMIT;

-- Display summary
DO $$
DECLARE
    org_count INTEGER;
    user_count INTEGER;
    lead_count INTEGER;
    segment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO org_count FROM organizations;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO lead_count FROM leads;
    SELECT COUNT(*) INTO segment_count FROM lead_segments;
    
    RAISE NOTICE '=== Database Seeding Summary ===';
    RAISE NOTICE 'Organizations created: %', org_count;
    RAISE NOTICE 'Users created: %', user_count;
    RAISE NOTICE 'Leads created: %', lead_count;
    RAISE NOTICE 'Lead segments created: %', segment_count;
    RAISE NOTICE '================================';
    RAISE NOTICE 'Demo credentials:';
    RAISE NOTICE 'Admin: admin@leadsrapido.com / admin123';
    RAISE NOTICE 'Demo Org Admin: admin@empresademo.com.br / demo123';
    RAISE NOTICE '================================';
END;
$$;