-- This script should be run manually after creating the first admin user through Supabase Auth
-- Update the UUID below with the actual user ID from auth.users

-- Example: Update a user to admin role
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@chia.gov.co';

-- Or insert a profile manually if needed
-- INSERT INTO profiles (id, email, full_name, role, dependencia)
-- VALUES (
--   'YOUR-USER-UUID-HERE',
--   'admin@chia.gov.co',
--   'Administrador Principal',
--   'admin',
--   'Secretaría General'
-- );

-- Note: The first admin user must be created manually through Supabase dashboard
-- or by temporarily disabling RLS, creating the user, then re-enabling RLS
