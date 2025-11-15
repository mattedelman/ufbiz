-- Automatic User Profile Creation
-- Run this AFTER simple-schema.sql
-- This automatically creates a user_profile when a user is created in Supabase Auth

-- Function to automatically create user_profile when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now when you create a user in Supabase Auth → Users, a user_profile is automatically created!
-- The organization_id will be NULL initially - link users via the admin dashboard interface

