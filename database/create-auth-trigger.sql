-- Function untuk membuat profile otomatis saat user register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    full_name,
    username,
    phone_number,
    role,
    is_verified,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    false,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger yang akan dijalankan saat ada user baru di auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies untuk tabel users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy untuk user bisa melihat dan update profile sendiri
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Policy untuk admin bisa melihat semua user
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );