-- Migration to update schema for Anonymous/Contact-based Users

-- 1. Update Profiles Table
-- Drop the foreign key constraint to auth.users if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_id_fkey') THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

-- Alter id to be auto-generated (if not already)
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Add new columns for contact info
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text unique;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- 2. Update Listings Table
-- Make user_id nullable (optional, but good for flexibility)
ALTER TABLE public.listings ALTER COLUMN user_id DROP NOT NULL;

-- 3. Update RLS Policies

-- Profiles Policies
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( true ); -- Allow anyone (server action handles logic)

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Listings Policies
DROP POLICY IF EXISTS "Authenticated users can create listings." ON public.listings;
DROP POLICY IF EXISTS "Anyone can create listings." ON public.listings;

CREATE POLICY "Anyone can create listings."
  ON public.listings FOR INSERT
  WITH CHECK ( true );

-- 4. Add Trigger for Auth User Creation (if not exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
