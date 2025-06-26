import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Create a .env.local file in the root of your project
// and add your Supabase URL and Anon Key there.
// NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
