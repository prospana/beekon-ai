-- =================================================================
-- Self-Hosted Supabase Pre-Migration Setup
-- =================================================================
-- This migration prepares a self-hosted Supabase or PostgreSQL instance
-- for the main Beekon.ai database structure migration.
--
-- It handles missing dependencies, creates required schemas, roles,
-- and extensions that may not exist in a fresh self-hosted setup.
-- =================================================================

BEGIN;

-- =================================================================
-- 1. EXTENSION INSTALLATION
-- =================================================================

-- Install required PostgreSQL extensions
DO $$
BEGIN
  -- UUID extension for gen_random_uuid()
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  RAISE NOTICE 'uuid-ossp extension ready';
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Failed to create uuid-ossp extension: %. Trying pgcrypto...', SQLERRM;
    BEGIN
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      RAISE NOTICE 'pgcrypto extension ready (alternative UUID generation)';
    EXCEPTION
      WHEN others THEN
        RAISE WARNING 'Neither uuid-ossp nor pgcrypto available. UUID generation may fail: %', SQLERRM;
    END;
END $$;

-- JSONB support (usually built-in for PG 9.4+)
DO $$
BEGIN
  -- Test JSONB functionality
  PERFORM '{"test": true}'::jsonb;
  RAISE NOTICE 'JSONB support confirmed';
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'JSONB support required but not available: %', SQLERRM;
END $$;

-- =================================================================
-- 2. ROLE CREATION
-- =================================================================

-- Create standard Supabase roles if they don't exist
DO $$
BEGIN
  -- Create authenticated role
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
    RAISE NOTICE 'Created authenticated role';
  ELSE
    RAISE NOTICE 'authenticated role already exists';
  END IF;

  -- Create service_role
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role;
    RAISE NOTICE 'Created service_role';
  ELSE
    RAISE NOTICE 'service_role already exists';
  END IF;

  -- Create anon role (anonymous access)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
    RAISE NOTICE 'Created anon role';
  ELSE
    RAISE NOTICE 'anon role already exists';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE WARNING 'Insufficient privileges to create roles. You may need to run this as superuser.';
  WHEN others THEN
    RAISE WARNING 'Error creating roles: %', SQLERRM;
END $$;

-- =================================================================
-- 3. AUTH SCHEMA SETUP
-- =================================================================

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant usage on auth schema
DO $$
BEGIN
  GRANT USAGE ON SCHEMA auth TO authenticated;
  GRANT USAGE ON SCHEMA auth TO service_role;
  GRANT USAGE ON SCHEMA auth TO anon;
EXCEPTION
  WHEN undefined_object THEN
    RAISE WARNING 'Could not grant usage on auth schema to some roles';
  WHEN others THEN
    RAISE WARNING 'Error granting auth schema permissions: %', SQLERRM;
END $$;

-- Create minimal auth.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  invited_at TIMESTAMP WITH TIME ZONE,
  confirmation_token TEXT,
  confirmation_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_token TEXT,
  recovery_sent_at TIMESTAMP WITH TIME ZONE,
  email_change_token_new TEXT,
  email_change TEXT,
  email_change_sent_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  raw_app_meta_data JSONB DEFAULT '{}',
  raw_user_meta_data JSONB DEFAULT '{}',
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  phone TEXT UNIQUE,
  phone_confirmed_at TIMESTAMP WITH TIME ZONE,
  phone_change TEXT,
  phone_change_token TEXT,
  phone_change_sent_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_token_current TEXT,
  email_change_confirm_status SMALLINT DEFAULT 0,
  banned_until TIMESTAMP WITH TIME ZONE,
  reauthentication_token TEXT,
  reauthentication_sent_at TIMESTAMP WITH TIME ZONE,
  is_sso_user BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create auth.uid() function if it doesn't exist
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::UUID;
$$;

-- Alternative auth.uid() function for environments without JWT
CREATE OR REPLACE FUNCTION auth.uid_fallback()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT COALESCE(
    auth.uid(),
    nullif(current_setting('app.current_user_id', true), '')::UUID,
    '00000000-0000-0000-0000-000000000000'::UUID
  );
$$;

-- =================================================================
-- 4. STORAGE SCHEMA SETUP
-- =================================================================

-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Grant usage on storage schema
DO $$
BEGIN
  GRANT USAGE ON SCHEMA storage TO authenticated;
  GRANT USAGE ON SCHEMA storage TO service_role;
  GRANT USAGE ON SCHEMA storage TO anon;
EXCEPTION
  WHEN undefined_object THEN
    RAISE WARNING 'Could not grant usage on storage schema to some roles';
  WHEN others THEN
    RAISE WARNING 'Error granting storage schema permissions: %', SQLERRM;
END $$;

-- Create storage.buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  public BOOLEAN DEFAULT FALSE,
  avif_autodetection BOOLEAN DEFAULT FALSE,
  file_size_limit BIGINT,
  allowed_mime_types TEXT[]
);

-- Create storage.objects table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id TEXT REFERENCES storage.buckets(id),
  name TEXT NOT NULL,
  owner UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  path_tokens TEXT[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
  version TEXT,
  
  UNIQUE(bucket_id, name)
);

-- Create storage helper functions
CREATE OR REPLACE FUNCTION storage.foldername(name TEXT)
RETURNS TEXT[]
LANGUAGE SQL IMMUTABLE
AS $$
  SELECT string_to_array(name, '/');
$$;

CREATE OR REPLACE FUNCTION storage.filename(name TEXT)
RETURNS TEXT
LANGUAGE SQL IMMUTABLE
AS $$
  SELECT split_part(name, '/', -1);
$$;

-- =================================================================
-- 5. UTILITY FUNCTIONS
-- =================================================================

-- Function to check if a schema exists
CREATE OR REPLACE FUNCTION public.schema_exists(schema_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM information_schema.schemata 
    WHERE schema_name = $1
  );
$$;

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.table_exists(schema_name TEXT, table_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = $1 AND table_name = $2
  );
$$;

-- Function to check if a role exists
CREATE OR REPLACE FUNCTION public.role_exists(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = $1
  );
$$;

-- =================================================================
-- 6. PERMISSION SETUP
-- =================================================================

-- Grant basic permissions on auth schema
DO $$
BEGIN
  GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
  GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
  GRANT USAGE ON ALL SEQUENCES IN SCHEMA auth TO authenticated;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error granting auth permissions: %', SQLERRM;
END $$;

-- Grant basic permissions on storage schema
DO $$
BEGIN
  GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA storage TO authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO service_role;
  GRANT USAGE ON ALL SEQUENCES IN SCHEMA storage TO authenticated;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error granting storage permissions: %', SQLERRM;
END $$;

-- =================================================================
-- 7. VALIDATION AND VERIFICATION
-- =================================================================

-- Verify the setup
DO $$
DECLARE
  auth_schema_exists BOOLEAN;
  storage_schema_exists BOOLEAN;
  auth_users_exists BOOLEAN;
  uuid_function_exists BOOLEAN;
BEGIN
  -- Check schemas
  SELECT public.schema_exists('auth') INTO auth_schema_exists;
  SELECT public.schema_exists('storage') INTO storage_schema_exists;
  
  -- Check critical tables
  SELECT public.table_exists('auth', 'users') INTO auth_users_exists;
  
  -- Check UUID function
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname IN ('gen_random_uuid', 'uuid_generate_v4')
  ) INTO uuid_function_exists;
  
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Self-Hosted Supabase Setup Completed';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Auth schema exists: %', auth_schema_exists;
  RAISE NOTICE 'Storage schema exists: %', storage_schema_exists;
  RAISE NOTICE 'Auth.users table exists: %', auth_users_exists;
  RAISE NOTICE 'UUID generation available: %', uuid_function_exists;
  RAISE NOTICE 'Authenticated role exists: %', public.role_exists('authenticated');
  RAISE NOTICE 'Service role exists: %', public.role_exists('service_role');
  RAISE NOTICE '';
  
  IF NOT auth_schema_exists THEN
    RAISE WARNING 'Auth schema setup failed - some features may not work';
  END IF;
  
  IF NOT storage_schema_exists THEN
    RAISE WARNING 'Storage schema setup failed - file uploads may not work';
  END IF;
  
  IF NOT uuid_function_exists THEN
    RAISE WARNING 'UUID generation not available - table creation may fail';
  END IF;
  
  RAISE NOTICE 'Setup ready for main migration!';
  RAISE NOTICE '=================================================================';
END $$;

COMMIT;

-- =================================================================
-- POST-SETUP NOTES
-- =================================================================
/*

SELF-HOSTED SUPABASE SETUP COMPLETED
=====================================

This migration prepares your self-hosted environment with:
✓ Required PostgreSQL extensions (uuid-ossp/pgcrypto)
✓ Standard Supabase roles (authenticated, service_role, anon)
✓ Auth schema with minimal users table
✓ Storage schema with buckets and objects tables
✓ Helper functions for compatibility
✓ Basic permissions and grants

NEXT STEPS:
-----------
1. Run the main migration: 20250110000011_complete_database_structure_self_hosted.sql
2. Configure your application environment variables
3. Test user registration and authentication
4. Verify file upload functionality

TROUBLESHOOTING:
----------------
If you encounter permission errors:
1. Ensure you're running as a superuser or database owner
2. Check that all required extensions are available
3. Verify network connectivity for extension downloads

For missing extensions:
1. Install postgresql-contrib package on your system
2. Restart PostgreSQL service
3. Re-run this migration

SECURITY NOTES:
---------------
- Default auth setup is minimal - configure proper authentication
- Set up SSL/TLS for production deployments
- Configure proper firewall rules
- Set strong passwords for database users

*/