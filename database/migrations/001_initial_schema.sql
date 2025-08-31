-- Migration: 001_initial_schema.sql
-- Description: Create initial database schema for LeadsRapido CRM
-- Author: Database Administrator
-- Date: 2025-01-20

BEGIN;

-- Create the schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Import the complete schema
\i ../schema.sql

-- Verify the migration
DO $$
BEGIN
    -- Check if critical tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        RAISE EXCEPTION 'Migration failed: organizations table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Migration failed: users table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        RAISE EXCEPTION 'Migration failed: leads table not created';
    END IF;
    
    -- Check if partitions were created
    IF (SELECT COUNT(*) FROM pg_tables WHERE tablename LIKE 'leads_part_%') < 16 THEN
        RAISE EXCEPTION 'Migration failed: lead partitions not created';
    END IF;
    
    -- Check if extensions are enabled
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE EXCEPTION 'Migration failed: uuid-ossp extension not enabled';
    END IF;
    
    RAISE NOTICE 'Migration 001_initial_schema completed successfully';
END;
$$;

COMMIT;