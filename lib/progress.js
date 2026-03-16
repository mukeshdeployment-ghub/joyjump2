import supabase from './supabase'

/**
 * Save lesson completion to Supabase.
 *
 * Uses the upsert_progress RPC function which:
 *  - updates the best_score row (best score wins, not last)
 *  - always inserts a new row in attempt_logs (full history)
 *
 * childId must be a UUID (from store.childId), never a name string.
 * Falls back silently if Supabase is not configured.
 */
export async function saveProgress({
  childId,
  lessonId,
  score,
  timeSpent = 0,
  phaseData = null,   // { gameScore, quizScore }
}) {
  if (!childId || childId === 'dhruvee') {
    // Graceful no-op in demo mode (no Supabase configured)
    return
  }

  try {
    const { error } = await supabase.rpc('upsert_progress', {
      p_child_id:  childId,
      p_lesson_id: lessonId,
      p_score:     score,
      p_time_sec:  timeSpent,
      p_phase:     phaseData ? JSON.stringify(phaseData) : null,
    })
    if (error) console.warn('[JoyJump] saveProgress:', error.message)
  } catch (e) {
    console.warn('[JoyJump] saveProgress network error:', e.message)
  }
}

/**
 * Log a session start.
 */
export async function logSessionStart({ childId }) {
  if (!childId || childId === 'dhruvee') return null

  try {
    const { data, error } = await supabase
      .from('session_logs')
      .insert({ child_id: childId, started_at: new Date().toISOString() })
      .select('id')
      .single()
    if (error) return null
    return data?.id || null
  } catch {
    return null
  }
}

/**
 * Log a session end with duration.
 */
export async function logSessionEnd({ sessionId, durationSec, lessonsDone = 0 }) {
  if (!sessionId) return

  try {
    await supabase
      .from('session_logs')
      .update({
        ended_at:     new Date().toISOString(),
        duration_sec: durationSec,
        lessons_done: lessonsDone,
      })
      .eq('id', sessionId)
  } catch {
    // Silent — session logging is non-critical
  }
}

/**
 * Load best-score progress for a child from Supabase.
 * Falls back to empty object if not available.
 */
export async function loadProgress(childId) {
  if (!childId || childId === 'dhruvee') return {}

  try {
    const { data, error } = await supabase
      .from('progress')
      .select('lesson_id, best_score, completed, attempts, last_at')
      .eq('child_id', childId)

    if (error || !data) return {}

    // Convert array to { lessonId: { score, completed, attempts, at } }
    return data.reduce((acc, row) => {
      acc[row.lesson_id] = {
        score:     row.best_score,
        completed: row.completed,
        attempts:  row.attempts,
        at:        row.last_at,
      }
      return acc
    }, {})
  } catch {
    return {}
  }
}

/**
 * Get weak lessons (score < 2) for a child — used in parent dashboard.
 */
export async function getWeakLessons(childId) {
  if (!childId || childId === 'dhruvee') return []

  try {
    const { data, error } = await supabase
      .from('progress')
      .select('lesson_id, best_score, attempts')
      .eq('child_id', childId)
      .eq('completed', true)
      .lt('best_score', 2)

    return error ? [] : (data || [])
  } catch {
    return []
  }
}

/**
 * Get total time spent learning (minutes) this week.
 */
export async function getWeeklyTime(childId) {
  if (!childId || childId === 'dhruvee') return 0

  try {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const { data, error } = await supabase
      .from('session_logs')
      .select('duration_sec')
      .eq('child_id', childId)
      .gte('started_at', weekAgo)

    if (error || !data) return 0
    return Math.round(data.reduce((sum, r) => sum + (r.duration_sec || 0), 0) / 60)
  } catch {
    return 0
  }
}
