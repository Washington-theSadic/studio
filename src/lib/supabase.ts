import { createBrowserClient } from '@supabase/ssr'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // This error will be caught during the build process if the variables are not set.
  throw new Error('Supabase URL and Anon Key must be provided in .env file.');
}

// It's safe to create a single instance of the client for the browser.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
