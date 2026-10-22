import { createClient } from '@supabase/supabase-js'

/**
 * The one Supabase client (ARCHITECTURE §7). Only files in services/supabase/ import it (NFR-51).
 * The URL and publishable key are public by design: RLS protects the data (D-30).
 * The secret / service-role key must never appear in frontend code (NFR-11).
 */
const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  throw new Error(
    'VITE_DATA_SOURCE is "supabase" but VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is missing. See .env.example.',
  )
}

// Defaults kept on purpose: the session is stored in localStorage and refreshed
// automatically (US-04), and links from emails are read from the URL (D-18, D-19).
export const supabase = createClient(url, publishableKey)
