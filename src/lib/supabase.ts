import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Create a .env.local file in the root of your project
// and add your Supabase URL and Anon Key there.
// NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn('Supabase credentials are not set in .env.local. Using placeholder values. The app will run, but database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
