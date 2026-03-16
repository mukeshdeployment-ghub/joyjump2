import { motion } from 'framer-motion'
import Link from 'next/link'
import { useJoyStore } from '../../lib/store'
import { StarRating, ProgressBar } from '../../components/rewards/Rewards'
import { play } from '../../lib/sounds'
import mathData    from '../../data/curriculum/math-mountain.json'
import storyData   from '../../data/curriculum/story-forest.json'
import scienceData from '../../data/curriculum/science-ocean.json'
import hindiData   from '../../data/curriculum/hindi-world.json'

// All three worlds aggregated
const WORLDS_DATA = [
  { id: 'math',    label: 'Math Mountain',  emoji: '🏔️', color: '#FB8C00', bg: '#FFF3E0', data: mathData    },
  { id: 'story',   label: 'Story Forest',   emoji: '🌲', color: '#43A047', bg: '#E8F5E9', data: storyData   },
  { id: 'science', label: 'Science Ocean',  emoji: '🔬', color: '#1E88E5', bg: '#E3F2FD', data: scienceData },
  { id: 'hindi',   label: 'Hindi World',   emoji: '🏵️', color: '#F57F17', bg: '#FFF8E1', data: hindiData   },
]

function getAllLessonsFromWorld(data) {
  const lessons = []
  data.topics.forEach(t => t.skills.forEach(sk => sk.lessons.forEach(l =>
    lessons.push({ ...l, topicTitle: t.title, topicEmoji: t.emoji, worldId: data.world })
  )))
  return lessons
}

function WorldCard({ world, progress }) {
  const allLessons = getAllLessonsFromWorld(world.data)
  const done = allLessons.filter(l => progress[l.id]?.completed).length
  const total = allLessons.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  // Per-topic breakdown
  const topicStats = world.data.topics.map(topic => {
    let topicDone = 0, topicTotal = 0
    topic.skills.forEach(sk => sk.lessons.forEach(l => {
      topicTotal++
      if (progress[l.id]?.completed) topicDone++
    }))
    return { ...topic, done: topicDone, total: topicTotal }
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-joy overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${world.color}22, ${world.color}08)`, borderBottom: `2px solid ${world.color}30` }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 32 }}>{world.emoji}</span>
          <div>
            <h2 className="font-fredoka text-xl" style={{ color: world.color }}>{world.label}</h2>
            <p className="font-nunito text-xs text-gray-400 font-semibold">{done}/{total} lessons · {pct}%</p>
          </div>
        </div>
        {pct === 100 && <span className="text-2xl">🏆</span>}
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-3 pb-1">
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full rounded-full relative overflow-hidden"
            style={{ background: `linear-gradient(90deg, ${world.color}, ${world.color}bb)` }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shimmer 2s linear infinite' }} />
          </motion.div>
        </div>
      </div>

      {/* Topic breakdown */}
      <div className="px-5 py-3 flex flex-col gap-2">
        {topicStats.map(topic => (
          <div key={topic.id} className="flex items-center gap-2">
            <span className="text-base w-6 flex-shrink-0">{topic.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-0.5">
                <span className="font-nunito text-xs font-bold text-gray-600 truncate">{topic.title}</span>
                <span className="font-nunito text-xs text-gray-400 font-bold flex-shrink-0 ml-2">{topic.done}/{topic.total}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }}
                  animate={{ width: `${topic.total > 0 ? (topic.done / topic.total) * 100 : 0}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full" style={{ background: world.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Go button */}
      <div className="px-5 pb-4">
        <Link href={`/worlds/${world.id}`}>
          <button onClick={() => play('tap')}
            className="joy-btn w-full text-sm py-3 font-bold"
            style={{ background: `linear-gradient(135deg, ${world.color}, ${world.color}cc)` }}>
            Continue in {world.label} →
          </button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { child, childId, stars, coins, streak, badges, progress, totalMinutesToday } = useJoyStore()

  // Aggregate all worlds
  const allLessons = WORLDS_DATA.flatMap(w => getAllLessonsFromWorld(w.data))
  const completedAll = allLessons.filter(l => progress[l.id]?.completed)
  const totalAll = allLessons.length

  // Recent activity across all worlds
  const recent = Object.entries(progress)
    .filter(([, v]) => v.completed)
    .sort((a, b) => new Date(b[1].at) - new Date(a[1].at))
    .slice(0, 6)
    .map(([id, data]) => {
      const lesson = allLessons.find(l => l.id === id)
      return lesson ? { lesson, ...data } : null
    })
    .filter(Boolean)

  // Weak topics: completed but score < 2
  const weakTopics = Object.entries(progress)
    .filter(([, v]) => v.completed && v.score < 2)
    .map(([id]) => allLessons.find(l => l.id === id))
    .filter(Boolean)
    .slice(0, 3)

  return (
    <div className="min-h-screen pb-24"
      style={{ background: 'linear-gradient(180deg, #1565C0 0%, #E3F2FD 30%, #F0F8FF 100%)' }}>

      {/* Header */}
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">👩‍👧</div>
          <div>
            <h1 className="font-fredoka text-2xl text-white">{child.name}'s Learning Journey</h1>
            <p className="font-nunito text-blue-200 text-sm font-semibold">Parent Dashboard · All Worlds</p>
          </div>
        </motion.div>

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
          {[
            { label: 'Stars', value: stars, icon: '⭐', color: '#FB8C00', bg: '#FFF3E0' },
            { label: 'Coins', value: coins, icon: '🪙', color: '#F57F17', bg: '#FFF8E1' },
            { label: 'Lessons', value: `${completedAll.length}/${totalAll}`, icon: '📚', color: '#43A047', bg: '#E8F5E9' },
            { label: 'Streak', value: `${streak}🔥`, icon: '', color: '#E53935', bg: '#FFEBEE' },
            { label: 'Today', value: `${totalMinutesToday || 0}m`, icon: '⏱', color: '#1E88E5', bg: '#E3F2FD' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-3 text-center shadow"
              style={{ background: s.bg }}>
              <p className="font-fredoka text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="font-nunito text-xs text-gray-400 font-bold">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* World cards — all three */}
        {WORLDS_DATA.map((world, i) => (
          <motion.div key={world.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}>
            <WorldCard world={world} progress={progress} />
          </motion.div>
        ))}

        {/* Weak topics alert */}
        {weakTopics.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-4">
            <h3 className="font-fredoka text-lg text-orange-700 mb-2 flex items-center gap-2">
              <span>⚠️</span> Needs more practice
            </h3>
            <p className="font-nunito text-xs text-orange-500 font-bold mb-2">
              {child.name} struggled with these — try them again!
            </p>
            {weakTopics.map(l => (
              <Link key={l.id} href={`/worlds/${l.worldId}/lesson/${l.id}`}>
                <div onClick={() => play('tap')}
                  className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 mb-1.5 shadow-sm cursor-pointer hover:shadow transition-all">
                  <span>{l.topicEmoji}</span>
                  <span className="font-nunito text-sm font-semibold text-gray-700">{l.title}</span>
                  <span className="ml-auto text-orange-400 font-bold">Retry →</span>
                </div>
              </Link>
            ))}
          </motion.div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-white rounded-3xl shadow-joy p-4">
            <h3 className="font-fredoka text-lg text-gray-700 mb-3">🏅 Badges Earned</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <motion.span key={b} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08, type: 'spring' }}
                  className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-1.5 font-baloo text-sm font-bold text-amber-800">
                  🏅 {b.replace(/_/g, ' ')}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {recent.length > 0 && (
          <div className="bg-white rounded-3xl shadow-joy p-4">
            <h3 className="font-fredoka text-lg text-gray-700 mb-3">📅 Recent Activity</h3>
            {recent.map(({ lesson, score, at }, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xl">{lesson.topicEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito text-sm font-bold text-gray-700 truncate">{lesson.title}</p>
                  <p className="font-nunito text-xs text-gray-400">{at ? new Date(at).toLocaleDateString('en-IN') : 'Recently'}</p>
                </div>
                <StarRating stars={score || 0} max={3} size="sm" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {completedAll.length === 0 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-5 text-center">
            <span className="text-5xl">🌱</span>
            <p className="font-fredoka text-xl text-green-700 mt-2">Ready to start learning!</p>
            <p className="font-nunito text-sm text-green-500 mt-1">
              {child.name}'s learning journey begins in Math Mountain. Tap below!
            </p>
            <Link href="/worlds/math">
              <button className="joy-btn joy-btn-orange mt-4 text-base py-3 px-6">Start in Math Mountain! 🏔️</button>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t-2 border-blue-100 safe-bottom z-40">
        <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
          {[
            { href: '/', icon: '🌈', label: 'Map' },
            { href: '/worlds/math', icon: '🏔️', label: 'Math' },
            { href: '/dashboard', icon: '📊', label: 'Progress', active: true },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => play('tap')}
                className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl cursor-pointer ${item.active ? 'bg-blue-50' : ''}`}>
                <span className="text-2xl">{item.icon}</span>
                <span className={`font-baloo text-xs font-bold ${item.active ? 'text-blue-600' : 'text-gray-400'}`}>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
