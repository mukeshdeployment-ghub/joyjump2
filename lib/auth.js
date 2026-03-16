import supabase from './supabase'

// ── Sign in via magic link (email OTP) ──────────────────────────
// Supabase sends a link to the parent's email.
// Clicking it redirects to /parent/verify which exchanges the token.
export async function signInWithMagicLink(email) {
  const redirectTo =
    (typeof window !== 'undefined' ? window.location.origin : '') +
    '/parent/verify'

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,   // auto-create account on first login
      emailRedirectTo: redirectTo,
    },
  })

  if (error) throw error
  return true
}

// ── Exchange OTP token from URL (called on /parent/verify) ───────
export async function verifyOtpFromUrl() {
  // Supabase Auth v2 handles PKCE automatically via detectSessionFromUrl.
  // We just need to get the current session after the redirect lands.
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// ── Sign out ─────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ── Get current session (synchronous snapshot) ──────────────────
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}

// ── Subscribe to auth state changes ─────────────────────────────
// Returns the unsubscribe function — call it on component unmount.
export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session)
  )
  return () => subscription.unsubscribe()
}

// ── Create or update parent's child profile in Supabase ─────────
// Called once after login if the child row doesn't exist yet.
// Links the browser's localStorage childId to the authenticated parent.
export async function syncChildProfile({ parentAuthId, childId, childName, avatar, grade }) {
  if (!parentAuthId || !childId) return null

  // Check if this childId already exists
  const { data: existing } = await supabase
    .from('children')
    .select('id')
    .eq('id', childId)
    .single()

  if (existing) {
    // Update parent_auth_id if it wasn't set yet (demo→auth upgrade)
    await supabase
      .from('children')
      .update({ parent_auth_id: parentAuthId })
      .eq('id', childId)
    return childId
  }

  // Create new child row
  const { data, error } = await supabase
    .from('children')
    .insert({
      id:             childId,
      parent_auth_id: parentAuthId,
      name:           childName || 'Learner',
      avatar:         avatar || 'panda',
      grade:          grade || 3,
    })
    .select('id')
    .single()

  if (error) {
    console.warn('[Auth] syncChildProfile error:', error.message)
    return null
  }
  return data?.id || null
}
