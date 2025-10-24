-- Create admin user: soporte@torrecentral.com
-- Password: chibcha123
-- This script creates the admin user for backoffice management

-- IMPORTANT: This script should be run through Supabase Dashboard SQL Editor
-- or with proper admin permissions

DO $$
DECLARE
  new_user_id uuid;
  existing_user_id uuid;
BEGIN
  -- Check if user already exists in profiles
  SELECT id INTO existing_user_id 
  FROM public.profiles 
  WHERE email = 'soporte@torrecentral.com';

  IF existing_user_id IS NOT NULL THEN
    RAISE NOTICE 'User already exists with ID: %', existing_user_id;
    
    -- Update profile to admin using correct column name 'dependencia'
    UPDATE public.profiles 
    SET role = 'admin',
        full_name = 'Administrador de Soporte',
        dependencia = 'Tecnología e Innovación',
        is_active = TRUE,
        updated_at = NOW()
    WHERE id = existing_user_id;
    
    RAISE NOTICE 'Profile updated to admin role';
  ELSE
    RAISE NOTICE 'User does not exist. Please create user through Supabase Dashboard first.';
    RAISE NOTICE 'Steps to create user:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User" button';
    RAISE NOTICE '3. Email: soporte@torrecentral.com';
    RAISE NOTICE '4. Password: chibcha123';
    RAISE NOTICE '5. Auto Confirm User: YES (check this box)';
    RAISE NOTICE '6. Click "Create User"';
    RAISE NOTICE '7. Then run this script again to set admin role';
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating admin user: %', SQLERRM;
END $$;

-- Verify the user was created/updated
DO $$
DECLARE
  user_role text;
  user_name text;
BEGIN
  SELECT role, full_name INTO user_role, user_name
  FROM public.profiles 
  WHERE email = 'soporte@torrecentral.com';
  
  IF user_role = 'admin' THEN
    RAISE NOTICE '✓ Admin user verified successfully';
    RAISE NOTICE '✓ Email: soporte@torrecentral.com';
    RAISE NOTICE '✓ Name: %', user_name;
    RAISE NOTICE '✓ Role: admin';
    RAISE NOTICE '✓ Can access: /admin dashboard with full permissions';
    RAISE NOTICE '✓ Features: Manage procedures, users, audit logs, and configuration';
  ELSIF user_role IS NOT NULL THEN
    RAISE WARNING 'User exists but role is not admin. Current role: %', user_role;
    RAISE NOTICE 'Run this script again to update to admin role';
  ELSE
    RAISE WARNING 'User not found. Please create through Supabase Dashboard first.';
  END IF;
END $$;
