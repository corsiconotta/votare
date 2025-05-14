import { createClient } from '@supabase/supabase-js';

// These environment variables will be provided after connecting to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Please connect to Supabase using the "Connect to Supabase" button.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);