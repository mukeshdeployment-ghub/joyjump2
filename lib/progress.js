import supabase from './supabase'

// Save lesson progress to Supabase
export async function saveProgress({ childId, lessonId, score, timeSpent, completed }) {
  const { error } = await supabase.from('progress').upsert({
    child_id: childId,
    lesson_id: lessonId,
    score,
    time_spent: timeSpent,
    completed,
    played_at: new Date().toISOString(),
  })
  if (error) console.error('Progress save error:', error)
}

// Load all progress for a child
export async function loadProgress(childId) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('child_id', childId)
    .order('played_at', { ascending: false })

  if (error) console.error('Progress load error:', error)
  return data || []
}

// Get subject mastery summary
export async function getSubjectMastery(childId) {
  const { data, error } = await supabase
    .from('progress')
    .select('lesson_id, score, completed')
    .eq('child_id', childId)
    .eq('completed', true)

  if (error) return {}

  const mastery = {}
  data.forEach(({ lesson_id, score }) => {
    const subject = lesson_id.split('-')[0]
    if (!mastery[subject]) mastery[subject] = { total: 0, count: 0 }
    mastery[subject].total += score
    mastery[subject].count += 1
  })

  Object.keys(mastery).forEach((s) => {
    mastery[s].avg = Math.round(mastery[s].total / mastery[s].count)
  })

  return mastery
}
