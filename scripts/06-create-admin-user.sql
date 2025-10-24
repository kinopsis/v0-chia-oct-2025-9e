-- Create admin user for backoffice management
-- Email: soporte@torrecentral.com
-- Password: chibcha 123

-- First, we need to create the user in Supabase Auth
-- This must be done through Supabase Auth API or Dashboard
-- The following is a reference for the profile that will be created

-- Insert profile for admin user
-- Note: The user_id should match the UUID from Supabase Auth
-- This script assumes the auth user has been created with email: soporte@torrecentral.com

-- You can create the auth user via Supabase Dashboard or using this SQL in the Supabase SQL Editor:
-- This creates the auth user (run this in Supabase SQL Editor with proper permissions)

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create auth user (this requires admin privileges in Supabase)
  -- Note: In production, use Supabase Dashboard or Auth API to create users
  -- This is a reference implementation
  
  -- Insert into auth.users (requires superuser or service_role key)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'soporte@torrecentral.com',
    crypt('chibcha 123', gen_salt('bf')), -- Password: chibcha 123
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create profile for the admin user
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    'soporte@torrecentral.com',
    'Administrador del Sistema',
    'admin',
    'Tecnología e Innovación',
    TRUE,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Admin user created successfully with ID: %', new_user_id;
  RAISE NOTICE 'Email: soporte@torrecentral.com';
  RAISE NOTICE 'Password: chibcha 123';
  RAISE NOTICE 'Role: admin';
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'User with email soporte@torrecentral.com already exists';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating admin user: %', SQLERRM;
END $$;

-- Grant admin permissions
-- The RLS policies already handle admin access, but we can verify the user exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = 'soporte@torrecentral.com' AND role = 'admin') THEN
    RAISE NOTICE 'Admin user profile verified successfully';
  ELSE
    RAISE WARNING 'Admin user profile not found. Please create it manually through Supabase Dashboard';
  END IF;
END $$;

-- Instructions for manual creation via Supabase Dashboard:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User" > "Create new user"
-- 3. Email: soporte@torrecentral.com
-- 4. Password: chibcha 123
-- 5. Auto Confirm User: YES
-- 6. After creation, the profile will be automatically created via trigger
-- 7. Update the profile role to 'admin' in the profiles table
