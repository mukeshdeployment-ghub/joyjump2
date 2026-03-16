import supabase from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { childId, lessonId, score, completed } = req.body
    if (!childId || !lessonId) return res.status(400).json({ error: 'Missing fields' })
    const { error } = await supabase.from('progress').upsert({
      child_id: childId, lesson_id: lessonId, score, completed,
      played_at: new Date().toISOString(),
    })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }
  res.status(405).json({ error: 'Method not allowed' })
}
