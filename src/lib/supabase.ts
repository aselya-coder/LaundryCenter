import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Ambil variabel lingkungan
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validasi variabel lingkungan
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in your environment variables.");
}

// Buat dan ekspor klien Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);