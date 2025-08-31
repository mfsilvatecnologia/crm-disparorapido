# Data Migration Strategy for LeadsRapido CRM

## Overview
This document outlines the comprehensive strategy for migrating existing Python/Selenium scraped data to the new PostgreSQL schema while ensuring data integrity, minimal downtime, and optimal performance.

## Current Data Analysis

### Source Data Format
- **Python/Selenium scraped data**: Likely in CSV, JSON, or database format
- **Expected volume**: Potentially millions of lead records
- **Data quality**: Variable, may contain duplicates and inconsistencies
- **Geographic distribution**: Primarily Brazilian market focus

### Data Quality Assessment Checklist
- [ ] Identify duplicate records across different sources
- [ ] Validate email formats and phone numbers
- [ ] Standardize company names and addresses
- [ ] Clean and normalize geographic data
- [ ] Assess data completeness and confidence scores

## Migration Phases

### Phase 1: Data Discovery and Preparation (Week 1)

#### 1.1 Source Data Inventory
```sql
-- Create temporary staging tables for analysis
CREATE TABLE staging_leads (
    source_id VARCHAR(255),
    source_system VARCHAR(50),
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_quality_report (
    check_name VARCHAR(100),
    passed_count INTEGER,
    failed_count INTEGER,
    failure_examples JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2 Data Quality Analysis Script
```python
# data_quality_analyzer.py
import pandas as pd
import re
from typing import Dict, List, Tuple

class DataQualityAnalyzer:
    def __init__(self, source_data_path: str):
        self.data = pd.read_csv(source_data_path)
        self.quality_report = {}
    
    def analyze_emails(self) -> Dict:
        """Validate email formats and detect duplicates"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        valid_emails = self.data['email'].apply(
            lambda x: bool(re.match(email_pattern, str(x))) if pd.notna(x) else False
        )
        
        duplicates = self.data['email'].duplicated().sum()
        
        return {
            'total_emails': len(self.data),
            'valid_emails': valid_emails.sum(),
            'invalid_emails': (~valid_emails).sum(),
            'duplicate_emails': duplicates,
            'null_emails': self.data['email'].isna().sum()
        }
    
    def analyze_companies(self) -> Dict:
        """Analyze company name consistency"""
        company_variations = self.data.groupby('company')['email'].count().sort_values(ascending=False)
        potential_duplicates = []
        
        for company in company_variations.index[:100]:  # Check top 100
            similar = self.data[
                self.data['company'].str.contains(company[:10], case=False, na=False)
            ]['company'].unique()
            if len(similar) > 1:
                potential_duplicates.append(similar.tolist())
        
        return {
            'total_companies': len(company_variations),
            'potential_duplicate_companies': len(potential_duplicates),
            'company_variations': potential_duplicates[:10]  # Top 10 examples
        }
    
    def analyze_geographic_data(self) -> Dict:
        """Validate and standardize geographic information"""
        states = self.data['state'].value_counts()
        cities = self.data['city'].value_counts()
        
        # Brazilian state codes validation
        valid_states = {
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
            'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
            'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        }
        
        invalid_states = self.data[
            ~self.data['state'].isin(valid_states)
        ]['state'].value_counts()
        
        return {
            'total_locations': len(self.data),
            'valid_states': len(states.index.intersection(valid_states)),
            'invalid_states': len(invalid_states),
            'top_states': states.head(10).to_dict(),
            'top_cities': cities.head(10).to_dict()
        }
    
    def generate_report(self) -> Dict:
        """Generate comprehensive data quality report"""
        return {
            'email_analysis': self.analyze_emails(),
            'company_analysis': self.analyze_companies(),
            'geographic_analysis': self.analyze_geographic_data(),
            'total_records': len(self.data)
        }
```

### Phase 2: Data Cleaning and Standardization (Week 2)

#### 2.1 Data Cleaning Pipeline
```python
# data_cleaner.py
import pandas as pd
import re
from unidecode import unidecode
from geopy.geocoders import Nominatim

class DataCleaner:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="leadsrapido_migration")
    
    def clean_emails(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate email addresses"""
        df['email_cleaned'] = df['email'].str.lower().str.strip()
        
        # Remove invalid emails
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        df['email_valid'] = df['email_cleaned'].apply(
            lambda x: bool(re.match(email_pattern, str(x))) if pd.notna(x) else False
        )
        
        return df
    
    def clean_phone_numbers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize Brazilian phone numbers"""
        def format_brazilian_phone(phone):
            if pd.isna(phone):
                return None
            
            # Remove all non-digits
            digits = re.sub(r'[^\d]', '', str(phone))
            
            # Format based on length
            if len(digits) == 11:  # Mobile with area code
                return f"+55 {digits[:2]} {digits[2:7]}-{digits[7:]}"
            elif len(digits) == 10:  # Landline with area code
                return f"+55 {digits[:2]} {digits[2:6]}-{digits[6:]}"
            else:
                return phone  # Return original if can't format
        
        df['phone_cleaned'] = df['phone'].apply(format_brazilian_phone)
        return df
    
    def clean_company_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize company names"""
        def standardize_company(name):
            if pd.isna(name):
                return None
            
            # Convert to title case and remove extra spaces
            name = str(name).strip().title()
            
            # Standardize common suffixes
            name = re.sub(r'\bLtda\.?$', 'LTDA', name)
            name = re.sub(r'\bS\.?A\.?$', 'S.A.', name)
            name = re.sub(r'\bME\.?$', 'ME', name)
            name = re.sub(r'\bEireli\.?$', 'EIRELI', name)
            
            return name
        
        df['company_cleaned'] = df['company'].apply(standardize_company)
        return df
    
    def clean_addresses(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize addresses"""
        # State code mapping
        state_mapping = {
            'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG',
            'Bahia': 'BA', 'Paraná': 'PR', 'Rio Grande do Sul': 'RS',
            # Add more mappings as needed
        }
        
        df['state_cleaned'] = df['state'].map(state_mapping).fillna(df['state'])
        df['city_cleaned'] = df['city'].str.title().str.strip()
        
        return df
    
    def assign_quality_score(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate quality score based on data completeness and validity"""
        def calculate_score(row):
            score = 0
            max_score = 100
            
            # Email validation (25 points)
            if row.get('email_valid', False):
                score += 25
            
            # Phone number (15 points)
            if pd.notna(row.get('phone_cleaned')):
                score += 15
            
            # Company information (20 points)
            if pd.notna(row.get('company_cleaned')):
                score += 20
            
            # Position/title (10 points)
            if pd.notna(row.get('position')):
                score += 10
            
            # Address information (15 points)
            if pd.notna(row.get('city_cleaned')) and pd.notna(row.get('state_cleaned')):
                score += 15
            
            # Website/LinkedIn (15 points)
            if pd.notna(row.get('website')) or pd.notna(row.get('linkedin')):
                score += 15
            
            return min(score, max_score)
        
        df['quality_score'] = df.apply(calculate_score, axis=1)
        return df
```

#### 2.2 Duplicate Detection Algorithm
```python
# duplicate_detector.py
import hashlib
from fuzzywuzzy import fuzz
import pandas as pd

class DuplicateDetector:
    def __init__(self, threshold: int = 85):
        self.threshold = threshold
    
    def generate_hash(self, email: str, name: str, company: str) -> str:
        """Generate hash for duplicate detection"""
        combined = f"{email or ''}{name or ''}{company or ''}".lower().strip()
        return hashlib.sha256(combined.encode()).hexdigest()
    
    def find_fuzzy_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Find potential duplicates using fuzzy matching"""
        duplicates = []
        
        for i, row1 in df.iterrows():
            for j, row2 in df.iterrows():
                if i >= j:  # Avoid checking same pair twice
                    continue
                
                # Calculate similarity scores
                name_score = fuzz.ratio(str(row1['name']), str(row2['name']))
                company_score = fuzz.ratio(str(row1['company']), str(row2['company']))
                email_score = 100 if row1['email'] == row2['email'] else 0
                
                # Weighted average
                total_score = (name_score * 0.4 + company_score * 0.4 + email_score * 0.2)
                
                if total_score >= self.threshold:
                    duplicates.append({
                        'id1': row1['id'],
                        'id2': row2['id'],
                        'similarity_score': total_score,
                        'name_score': name_score,
                        'company_score': company_score,
                        'email_score': email_score
                    })
        
        return pd.DataFrame(duplicates)
    
    def resolve_duplicates(self, df: pd.DataFrame, duplicates: pd.DataFrame) -> pd.DataFrame:
        """Resolve duplicates by keeping the highest quality record"""
        to_remove = set()
        
        for _, dup_row in duplicates.iterrows():
            id1, id2 = dup_row['id1'], dup_row['id2']
            
            if id1 in to_remove or id2 in to_remove:
                continue
            
            record1 = df[df['id'] == id1].iloc[0]
            record2 = df[df['id'] == id2].iloc[0]
            
            # Keep the record with higher quality score
            if record1['quality_score'] >= record2['quality_score']:
                to_remove.add(id2)
            else:
                to_remove.add(id1)
        
        return df[~df['id'].isin(to_remove)]
```

### Phase 3: Database Migration (Week 3)

#### 3.1 Migration Script
```python
# migrate_data.py
import psycopg2
import pandas as pd
from datetime import datetime
import logging
from typing import List, Dict
import json

class DatabaseMigrator:
    def __init__(self, connection_string: str):
        self.conn = psycopg2.connect(connection_string)
        self.cursor = self.conn.cursor()
        self.logger = self._setup_logger()
    
    def _setup_logger(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('migration.log'),
                logging.StreamHandler()
            ]
        )
        return logging.getLogger(__name__)
    
    def create_migration_organization(self) -> str:
        """Create migration organization for imported data"""
        org_query = """
        INSERT INTO organizations (
            name, plan, quota_total, status
        ) VALUES (%s, %s, %s, %s)
        RETURNING id;
        """
        
        self.cursor.execute(org_query, (
            'Migrated Data Organization',
            'enterprise',
            1000000,
            'active'
        ))
        
        org_id = self.cursor.fetchone()[0]
        self.conn.commit()
        
        self.logger.info(f"Created migration organization: {org_id}")
        return org_id
    
    def migrate_lead_segments(self, org_id: str, segments: List[Dict]) -> Dict[str, str]:
        """Migrate lead segments"""
        segment_mapping = {}
        
        segment_query = """
        INSERT INTO lead_segments (
            organization_id, name, description, color
        ) VALUES (%s, %s, %s, %s)
        RETURNING id;
        """
        
        for segment in segments:
            self.cursor.execute(segment_query, (
                org_id,
                segment['name'],
                segment.get('description', ''),
                segment.get('color', '#3b82f6')
            ))
            
            segment_id = self.cursor.fetchone()[0]
            segment_mapping[segment['name']] = segment_id
            
        self.conn.commit()
        self.logger.info(f"Migrated {len(segments)} lead segments")
        return segment_mapping
    
    def migrate_leads_batch(self, org_id: str, segment_mapping: Dict[str, str], 
                           leads_batch: pd.DataFrame) -> int:
        """Migrate a batch of leads"""
        lead_query = """
        INSERT INTO leads (
            organization_id, name, email, phone, company, position,
            website, linkedin_url, address_street, address_city,
            address_state, address_zip_code, address_country,
            segment_id, quality_score, tags, custom_fields,
            source, data_confidence, access_cost
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        migrated_count = 0
        
        for _, lead in leads_batch.iterrows():
            try:
                # Map segment
                segment_id = segment_mapping.get(lead.get('segment', 'Tecnologia'))
                
                # Prepare custom fields
                custom_fields = {}
                if pd.notna(lead.get('employees')):
                    custom_fields['employees'] = lead['employees']
                if pd.notna(lead.get('revenue')):
                    custom_fields['revenue'] = lead['revenue']
                
                self.cursor.execute(lead_query, (
                    org_id,
                    lead['name'],
                    lead.get('email_cleaned'),
                    lead.get('phone_cleaned'),
                    lead.get('company_cleaned'),
                    lead.get('position'),
                    lead.get('website'),
                    lead.get('linkedin'),
                    lead.get('address_street'),
                    lead.get('city_cleaned'),
                    lead.get('state_cleaned'),
                    lead.get('zip_code'),
                    'Brasil',
                    segment_id,
                    int(lead.get('quality_score', 50)),
                    lead.get('tags', []),
                    json.dumps(custom_fields),
                    'manual_import',
                    float(lead.get('data_confidence', 0.8)),
                    2.50
                ))
                
                migrated_count += 1
                
            except Exception as e:
                self.logger.error(f"Error migrating lead {lead.get('name', 'Unknown')}: {e}")
                continue
        
        self.conn.commit()
        return migrated_count
    
    def migrate_all_leads(self, df: pd.DataFrame, batch_size: int = 1000):
        """Migrate all leads in batches"""
        org_id = self.create_migration_organization()
        
        # Create default segments
        default_segments = [
            {'name': 'Tecnologia', 'description': 'Empresas de tecnologia', 'color': '#3b82f6'},
            {'name': 'Marketing', 'description': 'Agências de marketing', 'color': '#10b981'},
            {'name': 'Fintech', 'description': 'Empresas financeiras', 'color': '#f59e0b'},
            {'name': 'Outros', 'description': 'Outros segmentos', 'color': '#6b7280'}
        ]
        
        segment_mapping = self.migrate_lead_segments(org_id, default_segments)
        
        total_leads = len(df)
        migrated_total = 0
        
        for i in range(0, total_leads, batch_size):
            batch = df.iloc[i:i + batch_size]
            migrated_count = self.migrate_leads_batch(org_id, segment_mapping, batch)
            migrated_total += migrated_count
            
            self.logger.info(f"Migrated batch {i//batch_size + 1}: {migrated_count} leads")
            self.logger.info(f"Progress: {migrated_total}/{total_leads} ({migrated_total/total_leads*100:.1f}%)")
        
        self.logger.info(f"Migration completed: {migrated_total} leads migrated")
        return migrated_total
```

### Phase 4: Data Validation and Testing (Week 4)

#### 4.1 Validation Queries
```sql
-- Data validation queries to run after migration

-- Check data distribution
SELECT 
    'Total Organizations' as metric,
    COUNT(*) as value
FROM organizations
UNION ALL
SELECT 
    'Total Users' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Total Leads' as metric,
    COUNT(*) as value
FROM leads
UNION ALL
SELECT 
    'Leads with Email' as metric,
    COUNT(*) as value
FROM leads
WHERE email IS NOT NULL
UNION ALL
SELECT 
    'Leads with Phone' as metric,
    COUNT(*) as value
FROM leads
WHERE phone IS NOT NULL;

-- Quality score distribution
SELECT 
    CASE 
        WHEN quality_score >= 90 THEN 'Excellent (90-100)'
        WHEN quality_score >= 80 THEN 'Good (80-89)'
        WHEN quality_score >= 70 THEN 'Fair (70-79)'
        WHEN quality_score >= 60 THEN 'Poor (60-69)'
        ELSE 'Very Poor (<60)'
    END as quality_tier,
    COUNT(*) as lead_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM leads
GROUP BY 
    CASE 
        WHEN quality_score >= 90 THEN 'Excellent (90-100)'
        WHEN quality_score >= 80 THEN 'Good (80-89)'
        WHEN quality_score >= 70 THEN 'Fair (70-79)'
        WHEN quality_score >= 60 THEN 'Poor (60-69)'
        ELSE 'Very Poor (<60)'
    END
ORDER BY MIN(quality_score) DESC;

-- Geographic distribution
SELECT 
    address_state,
    COUNT(*) as lead_count,
    AVG(quality_score) as avg_quality_score
FROM leads
WHERE address_state IS NOT NULL
GROUP BY address_state
ORDER BY lead_count DESC
LIMIT 10;

-- Duplicate detection validation
SELECT 
    duplicate_hash,
    COUNT(*) as duplicate_count,
    array_agg(name) as names,
    array_agg(company) as companies
FROM leads
WHERE duplicate_hash IS NOT NULL
GROUP BY duplicate_hash
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 10;

-- Performance test queries
EXPLAIN ANALYZE
SELECT l.*, ls.name as segment_name
FROM leads l
JOIN lead_segments ls ON l.segment_id = ls.id
WHERE l.organization_id = '11111111-1111-1111-1111-111111111111'
AND l.quality_score >= 80
ORDER BY l.created_at DESC
LIMIT 50;
```

## Performance Optimization

### Index Creation Strategy
```sql
-- Additional performance indexes for migrated data
CREATE INDEX CONCURRENTLY idx_leads_migration_batch 
ON leads(source, created_at) 
WHERE source = 'manual_import';

CREATE INDEX CONCURRENTLY idx_leads_quality_migration 
ON leads(organization_id, quality_score DESC, created_at DESC)
WHERE source = 'manual_import';

-- Analyze tables after migration
ANALYZE organizations;
ANALYZE users;
ANALYZE leads;
ANALYZE lead_segments;
ANALYZE lead_accesses;
```

### Monitoring During Migration
```sql
-- Monitor migration progress
CREATE OR REPLACE VIEW migration_progress AS
SELECT 
    source,
    COUNT(*) as total_leads,
    AVG(quality_score) as avg_quality,
    MIN(created_at) as first_migrated,
    MAX(created_at) as last_migrated
FROM leads
GROUP BY source;

-- Monitor database performance
CREATE OR REPLACE VIEW migration_performance AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE tablename IN ('leads', 'organizations', 'lead_segments');
```

## Rollback Strategy

### Backup Before Migration
```bash
#!/bin/bash
# backup_before_migration.sh

# Create database backup
pg_dump -h localhost -U postgres -d leadsrapido \
    --format=custom \
    --verbose \
    --file="backup_$(date +%Y%m%d_%H%M%S).dump"

# Create schema-only backup
pg_dump -h localhost -U postgres -d leadsrapido \
    --schema-only \
    --verbose \
    --file="schema_backup_$(date +%Y%m%d_%H%M%S).sql"
```

### Rollback Procedure
```sql
-- Rollback procedure if migration fails
CREATE OR REPLACE FUNCTION rollback_migration(p_organization_id UUID)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete all migrated data for specific organization
    DELETE FROM lead_accesses WHERE organization_id = p_organization_id;
    DELETE FROM activities WHERE organization_id = p_organization_id;
    DELETE FROM pipeline_leads WHERE organization_id = p_organization_id;
    DELETE FROM pipeline_stages WHERE organization_id = p_organization_id;
    DELETE FROM leads WHERE organization_id = p_organization_id;
    DELETE FROM lead_segments WHERE organization_id = p_organization_id;
    DELETE FROM users WHERE organization_id = p_organization_id;
    DELETE FROM organizations WHERE id = p_organization_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Reset sequences if needed
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

## Success Criteria

### Data Integrity Checks
- [ ] All source records migrated (within 99.5% threshold)
- [ ] No duplicate records in target database
- [ ] All foreign key relationships maintained
- [ ] Quality scores calculated correctly
- [ ] Geographic data properly standardized

### Performance Benchmarks
- [ ] Lead search queries execute under 500ms
- [ ] Full-text search responds under 200ms
- [ ] Dashboard analytics load under 1s
- [ ] API endpoints maintain 99.9% uptime
- [ ] Database connection pool stable

### Business Validation
- [ ] Sample data verified by business users
- [ ] Quality scores align with manual assessment
- [ ] Geographic distribution matches expectations
- [ ] Segment categorization accurate
- [ ] Integration with frontend working properly

## Post-Migration Tasks

1. **Performance Tuning**
   - Analyze query patterns
   - Optimize slow queries
   - Adjust connection pool settings
   - Monitor resource usage

2. **Data Cleanup**
   - Archive old staging tables
   - Clean up temporary files
   - Update documentation
   - Remove migration scripts

3. **Monitoring Setup**
   - Configure alerts for data quality
   - Set up automated backups
   - Monitor duplicate detection
   - Track user adoption

4. **Training and Documentation**
   - Update API documentation
   - Train support team
   - Create user guides
   - Document troubleshooting procedures