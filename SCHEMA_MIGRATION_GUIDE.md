# Schema Migration Guide: Moving Tables to beekon_data Schema

## Overview
This guide explains how to migrate the `profiles` and `api_keys` tables from the `public` schema to the `beekon_data` schema while maintaining data integrity and fixing foreign key constraint issues.

## Problem Solved
The original migration failed due to foreign key constraint violations where workspace records referenced profile IDs that didn't exist. This corrected migration sequence handles:

1. **Orphaned workspace records** - Workspaces with owner_id values that don't exist in profiles
2. **Missing profile records** - Creating profiles for workspace owners that exist in auth.users
3. **Data integrity validation** - Ensuring all foreign key relationships are valid before applying constraints
4. **Safe migration order** - Proper sequencing to avoid constraint violations

## Migration Sequence

### 1. Diagnostic Migration (Optional but Recommended)
```sql
-- File: 20250110000007_diagnose_foreign_key_issue.sql
```
**Purpose**: Analyze current data state and identify orphaned records
**Output**: Detailed report of data integrity issues

### 2. Fixed Profiles Migration
```sql
-- File: 20250110000008_migrate_profiles_fixed.sql
```
**Key Features**:
- Creates missing profiles for workspace owners that exist in auth.users
- Sets owner_id to NULL for workspaces with completely missing users
- Validates data integrity before applying foreign key constraints
- Migrates all data, RLS policies, triggers, and indexes

### 3. Fixed API Keys Migration
```sql
-- File: 20250110000009_migrate_api_keys_fixed.sql
```
**Key Features**:
- Validates all API keys reference existing auth.users
- Skips orphaned API keys during migration
- Preserves only valid API key records
- Migrates RLS policies, triggers, and indexes

### 4. Final Verification
```sql
-- File: 20250110000010_verify_schema_migration.sql
```
**Purpose**: Comprehensive validation of completed migration
**Checks**:
- Table existence in beekon_data schema
- Foreign key constraints are properly configured
- RLS policies are in place
- No orphaned records remain
- Data integrity is maintained

## Data Handling Strategy

### Orphaned Workspaces
1. **Create profiles** for workspace owners that exist in `auth.users`
2. **Set owner_id to NULL** for workspaces whose owners don't exist in `auth.users`
3. **Validate** all relationships before applying constraints

### Orphaned API Keys
1. **Skip migration** of API keys that reference non-existent auth users
2. **Preserve only valid** API key records
3. **Log** the number of skipped records for review

### Data Integrity Measures
- Transactional operations to ensure atomicity
- Row count validation before/after migration
- Foreign key constraint validation before application
- Comprehensive error handling and rollback capabilities

## Application Code Changes

### TypeScript Types Updated
- Moved `profiles` and `api_keys` from `public` to `beekon_data` schema in type definitions
- Updated service layer type imports

### Service Layer Changes
- Updated ProfileService to use `beekon_data.profiles`
- Updated ApiKeyService to use `beekon_data.api_keys`
- Updated Supabase client default schema to `beekon_data`

### Foreign Key Relationships
- `beekon_data.workspaces.owner_id` → `beekon_data.profiles.id`
- `beekon_data.profiles.workspace_id` → `beekon_data.workspaces.id`
- `beekon_data.profiles.user_id` → `auth.users.id`
- `beekon_data.api_keys.user_id` → `auth.users.id`

## Migration Execution Order

1. **Optional**: Run diagnostic migration to understand current state
2. **Required**: Run profiles migration (handles the most complex relationships)
3. **Required**: Run API keys migration  
4. **Recommended**: Run verification migration to confirm success

## Rollback Strategy

If migration needs to be rolled back:
1. Old tables in `public` schema are preserved
2. Update application code to use `public` schema
3. Drop new tables in `beekon_data` schema
4. Restore original foreign key constraints

## Post-Migration Cleanup

After confirming the migration works correctly:
1. Drop old `public.profiles` table: `DROP TABLE public.profiles CASCADE;`
2. Drop old `public.api_keys` table: `DROP TABLE public.api_keys CASCADE;`
3. Remove backup tables if created
4. Update documentation to reflect new schema structure

## Validation Checklist

✅ All tables exist in `beekon_data` schema  
✅ Foreign key constraints are properly configured  
✅ RLS policies are in place and working  
✅ No orphaned records exist  
✅ Application compiles without TypeScript errors  
✅ Settings page functionality works correctly  
✅ Authentication flow creates profiles in correct schema  
✅ API key management functions properly  

## Error Prevention

This corrected migration prevents the original error:
```
ERROR: 23503: insert or update on table "workspaces" violates foreign key constraint "workspaces_owner_id_fkey"
```

By ensuring all workspace owner_id values have corresponding profile records before applying the foreign key constraint.