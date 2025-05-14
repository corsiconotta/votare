/*
  # Add initial admin user

  1. Changes
    - Insert initial admin user into auth.users
    - Insert corresponding user record into public.users
*/

-- Insert admin user into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Insert corresponding user record
INSERT INTO public.users (
  id,
  email,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  'admin'
) ON CONFLICT (id) DO NOTHING;