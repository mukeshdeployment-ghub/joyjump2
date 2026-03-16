import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('[JoyJump] Supabase env vars not set — running in demo mode (localStorage only).')
}

export const supabase = createClient(
  supabaseUrl     || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // PKCE flow — required for magic link in Next.js (no implicit flow)
      flowType:            'pkce',
      // Persist session across tabs + reloads
      persistSession:      true,
      // Auto-refresh token before it expires
      autoRefreshToken:    true,
      // Detect and exchange the auth token from the URL after redirect
      detectSessionFromUrl: true,
    },
  }
)

export default supabase
