-- ========================================
-- FIXED RLS (Row Level Security) Policies for listing_packages table
-- ========================================

-- First, ensure RLS is enabled on the table
ALTER TABLE listing_packages ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Drop existing policies if they exist (to avoid conflicts)
-- ========================================
DROP POLICY IF EXISTS "Allow anonymous read access" ON listing_packages;
DROP POLICY IF EXISTS "Allow authenticated read access" ON listing_packages;
DROP POLICY IF EXISTS "Allow service role full access" ON listing_packages;
DROP POLICY IF EXISTS "Allow admin full access" ON listing_packages;
DROP POLICY IF EXISTS "Enable read access for all users" ON listing_packages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON listing_packages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON listing_packages;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON listing_packages;
DROP POLICY IF EXISTS "Allow public read access to active packages" ON listing_packages;
DROP POLICY IF EXISTS "Allow authenticated full access" ON listing_packages;

-- ========================================
-- Simple and Effective Policies
-- ========================================

-- 1. Allow anonymous users to read active packages only
-- This allows public users to see available packages
CREATE POLICY "Allow public read access to active packages" ON listing_packages
    FOR SELECT USING (
        is_active = true
    );

-- 2. Allow authenticated users to perform all operations
-- This allows logged-in users to manage packages
CREATE POLICY "Allow authenticated full access" ON listing_packages
    FOR ALL USING (
        auth.role() = 'authenticated'
    );

-- 3. Allow service role (backend) full access
-- This allows the backend service to perform all operations
CREATE POLICY "Allow service role full access" ON listing_packages
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- ========================================
-- Alternative: If you have role-based admin system
-- Uncomment and modify this section if you have a users table with role management
-- ========================================

/*
-- Check if your users table exists and has role column
-- Replace 'users' with your actual table name if different

-- 4. Allow admin users full access (if you have admin role management)
CREATE POLICY "Allow admin full access" ON listing_packages
    FOR ALL USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );
*/

-- ========================================
-- Grant necessary permissions
-- ========================================

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant select permissions on the table
GRANT SELECT ON listing_packages TO anon, authenticated, service_role;

-- Grant all permissions to authenticated and service_role
GRANT ALL ON listing_packages TO authenticated, service_role;

-- ========================================
-- Additional recommendations
-- ========================================

-- Create an index on is_active for better performance
CREATE INDEX IF NOT EXISTS idx_listing_packages_is_active ON listing_packages(is_active);

-- Create an index on slug for better performance
CREATE INDEX IF NOT EXISTS idx_listing_packages_slug ON listing_packages(slug);

-- Create an index on display_order for better performance
CREATE INDEX IF NOT EXISTS idx_listing_packages_display_order ON listing_packages(display_order);

-- ========================================
-- Test the policies (uncomment to test)
-- ========================================

-- Test 1: Anonymous user can read active packages
-- SET LOCAL ROLE anon;
-- SELECT COUNT(*) FROM listing_packages WHERE is_active = true;

-- Test 2: Authenticated user can read all packages
-- SET LOCAL ROLE authenticated;
-- SELECT COUNT(*) FROM listing_packages;

-- Test 3: Service role can perform all operations
-- SET LOCAL ROLE service_role;
-- INSERT INTO listing_packages (name, slug, price, duration_days) VALUES ('Test', 'test', 0, 30);
-- UPDATE listing_packages SET name = 'Test Updated' WHERE slug = 'test';
-- DELETE FROM listing_packages WHERE slug = 'test';

-- ========================================
-- Simple Debug Query to check policies
-- ========================================

-- Check which policies are active
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'listing_packages';