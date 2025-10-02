-- Update RLS policies untuk memungkinkan operasi dasar
-- Script ini menambahkan kebijakan yang diperlukan untuk aplikasi

-- Drop existing policies untuk users jika ada
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Kebijakan baru untuk users
-- Memungkinkan siapa saja untuk membuat akun baru (registrasi)
CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (true);

-- Users dapat melihat profil mereka sendiri
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);

-- Users dapat memperbarui profil mereka sendiri
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Admin dapat melihat semua users (opsional)
CREATE POLICY "Admin can view all users" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id::text = auth.uid()::text 
        AND users.role = 'admin'
    )
);

-- Untuk development: sementara disable RLS pada users table
-- Uncomment baris berikut jika ingin disable RLS untuk testing
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Atau, untuk memungkinkan semua operasi tanpa autentikasi (hanya untuk development)
-- CREATE POLICY "Allow all operations for development" ON users FOR ALL USING (true) WITH CHECK (true);