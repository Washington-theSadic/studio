import { createClient } from '@supabase/supabase-js'

// The Supabase URL and Key are now hardcoded for immediate functionality.
// For production environments, it is recommended to use environment variables.
const supabaseUrl = 'https://sctvzllsrwghijlcioxz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHZ6bGxzcndnaGlqbGNpb3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTg2ODEsImV4cCI6MjA2NjUzNDY4MX0.pcQlAVWTZPMhAhf-4vS-DBu4bZIe7C2g0nt8CVK230I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
