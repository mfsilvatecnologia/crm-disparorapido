# LeadsRapido Database Architecture

## Overview

This document provides comprehensive information about the LeadsRapido CRM database architecture, designed for a multi-tenant SaaS lead generation system with high performance and scalability requirements.

## Database Technology Stack

- **Database Engine**: PostgreSQL 15+
- **ORM**: Prisma Client
- **Extensions**: uuid-ossp, pg_stat_statements, pg_trgm, btree_gin, postgis
- **Full-text Search**: PostgreSQL native tsvector with Portuguese language support
- **Geographic Data**: PostGIS for location-based searches
- **Partitioning**: Hash partitioning for leads table (16 partitions)
- **Row Level Security**: Multi-tenant data isolation

## Architecture Principles

### 1. Multi-Tenancy Strategy
- **Organization-based isolation**: Each organization's data is logically separated
- **Shared database, separate schemas**: All tenants share the same database instance
- **Row Level Security (RLS)**: PostgreSQL RLS policies enforce data isolation
- **Performance optimization**: Hash partitioning by organization_id for leads table

### 2. Data Security
- **Encryption at rest**: PostgreSQL native encryption support
- **SSL/TLS connections**: All database connections encrypted
- **Role-based access control**: Separate database roles for different access levels
- **Audit logging**: Comprehensive audit trail for all sensitive operations
- **Password hashing**: bcrypt with configurable rounds

### 3. Performance Design
- **Indexing strategy**: Comprehensive indexes for common query patterns
- **Materialized views**: Pre-computed analytics for dashboard performance
- **Connection pooling**: Optimized for high concurrency
- **Query optimization**: Specialized functions for complex searches
- **Caching ready**: Redis integration for session and query caching

## Database Schema

### Core Tables

#### Organizations
Primary entity for multi-tenancy, contains subscription and quota information.

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan organization_plan_enum,
    quota_total INTEGER,
    quota_used INTEGER,
    settings JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Key Features:**
- Quota management for lead access limits
- JSONB settings for flexible configuration
- Billing integration ready
- White-label support via subdomain

#### Users
User management with organization-based access control.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255),
    role user_role_enum,
    password_hash VARCHAR(255),
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Key Features:**
- Multi-role support (admin, org_admin, agent, viewer)
- Organization-scoped email uniqueness
- Account status management
- Authentication token support

#### Leads (Partitioned)
Core entity storing lead information with performance optimization.

```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY,
    organization_id UUID,
    name VARCHAR(255),
    email VARCHAR(255),
    company VARCHAR(255),
    segment_id UUID,
    quality_score INTEGER,
    tags TEXT[],
    custom_fields JSONB,
    search_vector tsvector,
    created_at TIMESTAMPTZ
) PARTITION BY HASH (organization_id);
```

**Key Features:**
- Hash partitioned for performance (16 partitions)
- Full-text search with Portuguese language support
- Quality scoring system (0-100)
- Flexible custom fields via JSONB
- Geographic data support with PostGIS
- Duplicate detection via hash comparison

### Supporting Tables

- **Lead Segments**: Categorization system for lead classification
- **Lead Accesses**: Audit trail for lead access and billing
- **Pipeline Stages**: Customizable sales pipeline stages
- **Pipeline Leads**: Leads in sales pipeline with deal tracking
- **Activities**: Interaction tracking (calls, emails, meetings)
- **API Keys**: API access management with rate limiting
- **Webhooks**: Event notification system
- **Daily Usage Stats**: Analytics and usage tracking

### Authentication Tables

- **Refresh Tokens**: JWT refresh token management
- **Password Reset Tokens**: Secure password reset flow
- **Email Verification Tokens**: Email verification process

## Indexing Strategy

### Primary Indexes
- **B-tree indexes** for primary keys and foreign keys
- **Composite indexes** for common query patterns
- **Partial indexes** for active records only
- **GIN indexes** for JSONB and array columns
- **GiST indexes** for full-text search
- **BRIN indexes** for time-series data

### Performance Indexes

```sql
-- High-performance lead searches
CREATE INDEX idx_leads_search_composite 
ON leads(organization_id, quality_score DESC, created_at DESC) 
INCLUDE (name, email, company);

-- Geographic searches
CREATE INDEX idx_leads_coordinates 
ON leads USING GIST(address_coordinates);

-- Full-text search
CREATE INDEX idx_leads_search_vector 
ON leads USING GIN(search_vector);

-- Tag-based filtering
CREATE INDEX idx_leads_tags_gin 
ON leads USING GIN(tags);
```

## Query Optimization

### Optimized Search Function
The `optimized_lead_search()` function provides high-performance lead searching with:
- Full-text search with relevance ranking
- Dynamic filtering by multiple criteria
- Proper index utilization
- Query performance logging

### Analytics Functions
- `get_lead_analytics()`: Efficient analytics data aggregation
- `search_leads()`: Full-text search with Portuguese language support
- Materialized views for dashboard metrics

## Multi-Tenant Security

### Row Level Security Policies
```sql
-- Organization data isolation
CREATE POLICY organization_isolation ON organizations
    USING (id = current_setting('app.current_organization_id')::UUID);

-- Lead access control
CREATE POLICY leads_organization_isolation ON leads
    USING (organization_id = current_setting('app.current_organization_id')::UUID);
```

### Session Variables
Application sets session variables for security context:
- `app.current_organization_id`: Current organization context
- `app.current_user_id`: Current user context
- `app.current_user_role`: User role for authorization
- `app.client_ip`: Client IP for audit logging

## Backup and Recovery

### Automated Backup System
- **Daily backups**: Automated via cron jobs
- **Point-in-time recovery**: WAL archiving enabled
- **Backup retention**: Configurable retention policy
- **Backup verification**: Automated backup testing

### Disaster Recovery
- **Recovery procedures**: Documented recovery processes
- **Backup monitoring**: Health checks and alerting
- **Cross-region replication**: For production environments

## Monitoring and Maintenance

### Performance Monitoring
- **Query performance**: pg_stat_statements integration
- **Connection monitoring**: Active connection tracking
- **Resource usage**: Memory and disk utilization
- **Index usage**: Index effectiveness analysis

### Automated Maintenance
- **VACUUM scheduling**: Automated table maintenance
- **Statistics updates**: Regular ANALYZE operations
- **Materialized view refresh**: Scheduled analytics updates
- **Quota reset**: Monthly quota management

### Health Checks
- **Database connectivity**: Connection validation
- **Data integrity**: Constraint validation
- **Performance metrics**: Query performance analysis
- **Security audit**: Permission and access review

## Installation and Setup

### Prerequisites
- PostgreSQL 15 or higher
- Minimum 2GB RAM (4GB+ recommended)
- 10GB+ available disk space
- Ubuntu/Debian Linux (recommended)

### Installation Steps

1. **Run setup script**:
   ```bash
   cd database/
   chmod +x setup.sh
   sudo ./setup.sh
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize Prisma**:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   ```

4. **Seed initial data**:
   ```bash
   npm run db:seed
   ```

### Manual Installation
If you prefer manual installation, follow these steps:

1. Install PostgreSQL and extensions
2. Create database and users
3. Apply schema: `psql -f database/schema.sql`
4. Apply optimizations: `psql -f database/security-performance.sql`
5. Set up monitoring: `psql -f database/backup-monitoring.sql`

## Configuration

### Connection Settings
```env
DATABASE_URL="postgresql://user:password@localhost:5432/leadsrapido"
DATABASE_POOL_SIZE=10
DATABASE_POOL_TIMEOUT=20
```

### Performance Tuning
Key PostgreSQL settings for optimal performance:

```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# Connection settings
max_connections = 200

# WAL settings
wal_buffers = 16MB
checkpoint_completion_target = 0.7
```

## API Integration

### Prisma Client Usage
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Set organization context
await prisma.$executeRaw`
  SET app.current_organization_id = ${organizationId};
  SET app.current_user_id = ${userId};
`;

// Query with RLS automatically applied
const leads = await prisma.lead.findMany({
  where: { isAccessed: false },
  include: { segment: true }
});
```

### Connection Management
- **Connection pooling**: Automatic connection management
- **Error handling**: Comprehensive error handling
- **Transaction support**: ACID transaction support
- **Performance monitoring**: Query performance tracking

## Migration Strategy

### Data Migration Process
1. **Assessment phase**: Analyze existing data quality
2. **Cleaning phase**: Standardize and deduplicate data
3. **Migration phase**: Transfer data with validation
4. **Validation phase**: Verify data integrity
5. **Go-live phase**: Switch to production

### Migration Tools
- Python scripts for data cleaning
- SQL scripts for bulk data import
- Validation queries for data integrity
- Rollback procedures for safety

## Best Practices

### Development
- Always use transactions for multi-table operations
- Implement proper error handling
- Use Prisma migrations for schema changes
- Test RLS policies thoroughly

### Production
- Monitor query performance regularly
- Implement automated backups
- Use connection pooling
- Enable SSL/TLS for all connections
- Regular security audits

### Performance
- Use appropriate indexes
- Avoid N+1 queries
- Implement caching where appropriate
- Monitor and optimize slow queries

## Troubleshooting

### Common Issues

**Connection Problems**:
- Check pg_hba.conf configuration
- Verify SSL certificate setup
- Confirm firewall settings

**Performance Issues**:
- Analyze slow queries with EXPLAIN
- Check index usage
- Monitor connection pool utilization
- Review table statistics

**Data Issues**:
- Run integrity checks
- Verify RLS policies
- Check quota calculations
- Validate foreign key constraints

### Diagnostic Queries

```sql
-- Check active connections
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;

-- Find slow queries
SELECT query, mean_time, calls FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read 
FROM pg_stat_user_indexes ORDER BY idx_scan DESC;

-- Monitor table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Support and Maintenance

### Regular Maintenance Tasks
- **Daily**: Monitor health checks and backups
- **Weekly**: Review slow queries and optimize
- **Monthly**: Analyze growth trends and capacity
- **Quarterly**: Security audit and updates

### Emergency Procedures
- Database recovery from backup
- Performance issue escalation
- Security incident response
- Disaster recovery activation

## Version History

- **v1.0**: Initial database schema and architecture
- **v1.1**: Added geographic search capabilities
- **v1.2**: Performance optimizations and monitoring
- **v1.3**: Enhanced security and RLS policies

## Contact Information

For database-related issues or questions:
- **Database Team**: db-team@leadsrapido.com
- **Emergency**: +55 11 99999-0000
- **Documentation**: https://docs.leadsrapido.com/database