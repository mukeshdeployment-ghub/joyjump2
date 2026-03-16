import { motion } from 'framer-motion'
import Link from 'next/link'
import { useJoyStore } from '../../lib/store'
import { ProgressBar, StarRating } from '../../components/rewards/Rewards'
import { play } from '../../lib/sounds'
import mathData from '../../data/curriculum/math-mountain.json'

function getAllLessons() {
  const lessons = []
  mathData.topics.forEach(t => t.skills.forEach(sk => sk.lessons.forEach(l =>
    lessons.push({ ...l, topicTitle: t.title, topicEmoji: t.emoji })
  )))
  return lessons
}

export default function Dashboard() {
  const { child, stars, coins, streak, badges, progress } = useJoyStore()
  const allLessons = getAllLessons()
  const completed = allLessons.filter(l => progress[l.id]?.completed)
  const totalLessons = allLessons.length
  const completionPct = Math.round((completed.length / totalLessons) * 100)

  const topicStats = mathData.topics.map(topic => {
    let done = 0, total = 0, scoreSum = 0
    topic.skills.forEach(sk => sk.lessons.forEach(l => {
      total++
      if (progress[l.id]?.completed) { done++; scoreSum += progress[l.id].score || 0 }
    }))
    return { ...topic, done, total, avgPct: done > 0 ? Math.round((scoreSum / done) * 33.3) : 0 }
  })

  const recent = Object.entries(progress)
    .filter(([, v]) => v.completed)
    .sort((a, b) => new Date(b[1].at) - new Date(a[1].at))
    .slice(0, 6)
    .map(([id, data]) => ({ lesson: allLessons.find(l => l.id === id), ...data }))
    .filter(r => r.lesson)

  return (
    <div className="min-h-screen pb-24"
      style={{ background: 'linear-gradient(180deg, #E3F2FD 0%, #F0F8FF 100%)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 pb-4" style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">👩‍👧</div>
          <div>
            <h1 className="font-fredoka text-2xl text-white">{child.name}'s Progress</h1>
            <p className="font-nunito text-blue-200 text-sm font-semibold">Parent Dashboard</p>
          </div>
        </div>
      </motion.div>

      <div className="px-4 pt-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Stars Earned', value: stars, icon: '⭐', color: '#FB8C00', bg: '#FFF3E0' },
            { label: 'Coins', value: coins, icon: '🪙', color: '#F57F17', bg: '#FFF8E1' },
            { label: 'Lessons Done', value: `${completed.length}/${totalLessons}`, icon: '📚', color: '#43A047', bg: '#E8F5E9' },
            { label: 'Day Streak', value: `${streak}🔥`, icon: '', color: '#E53935', bg: '#FFEBEE' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-3xl p-4 text-center shadow-joy"
              style={{ background: stat.bg }}>
              <div style={{ fontSize: 32 }}>{stat.icon}</div>
              <p className="font-fredoka text-2xl mt-1" style={{ color: stat.color }}>{stat.value}</p>
              <p className="font-nunito text-xs text-gray-400 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Overall progress */}
        <div className="bg-white rounded-3xl shadow-joy p-5">
          <h2 className="font-fredoka text-xl text-gray-700 mb-3 flex items-center gap-2">📊 Math Mountain Progress</h2>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
              <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full rounded-full relative overflow-hidden"
                style={{ background: 'linear-gradient(90deg, #FB8C00, #FFD700)' }}>
                <div className="absolute inset-0 shimmer-overlay" />
              </motion.div>
            </div>
            <span className="font-fredoka text-2xl text-orange-500 flex-shrink-0">{completionPct}%</span>
          </div>
          <p className="font-nunito text-xs text-gray-400">{completed.length} of {totalLessons} lessons completed</p>
        </div>

        {/* Topic breakdown */}
        <div className="bg-white rounded-3xl shadow-joy p-5">
          <h2 className="font-fredoka text-xl text-gray-700 mb-4">📚 Topic by Topic</h2>
          <div className="flex flex-col gap-3">
            {topicStats.map(topic => (
              <div key={topic.id} className="flex items-center gap-3">
                <span className="text-2xl w-8 flex-shrink-0">{topic.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-nunito text-sm font-bold text-gray-700">{topic.title}</span>
                    <span className="font-nunito text-xs text-gray-400 font-bold">{topic.done}/{topic.total}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${topic.total > 0 ? (topic.done / topic.total) * 100 : 0}%` }}
                      transition={{ duration: 0.9, delay: 0.2 }}
                      className="h-full rounded-full" style={{ background: '#FB8C00' }} />
                  </div>
                </div>
                {topic.done > 0 && (
                  <span className="font-fredoka text-sm text-green-600 flex-shrink-0 w-10 text-right">{topic.avgPct}%</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-white rounded-3xl shadow-joy p-5">
            <h2 className="font-fredoka text-xl text-gray-700 mb-3">🏆 Badges Earned</h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <motion.div key={b} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08, type: 'spring' }}
                  className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-1.5">
                  <span>🏅</span>
                  <span className="font-baloo text-sm font-bold text-amber-800">{b.replace(/_/g, ' ')}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {recent.length > 0 && (
          <div className="bg-white rounded-3xl shadow-joy p-5">
            <h2 className="font-fredoka text-xl text-gray-700 mb-3">📅 Recent Activity</h2>
            <div className="flex flex-col gap-2">
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
          </div>
        )}

        {/* Recommendation */}
        <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-5">
          <h2 className="font-fredoka text-xl text-green-700 mb-2">💡 Recommendation</h2>
          <p className="font-nunito text-gray-600 text-sm">
            {completed.length === 0
              ? "Start with Math Mountain! The first lesson on 4-digit numbers is waiting! 🏔️"
              : completionPct < 30
              ? `Great start! ${child.name} is building strong number foundations. Keep the daily habit! 🌟`
              : completionPct < 70
              ? `${child.name} is making wonderful progress! Multiplication is coming up next! ✖️`
              : `Exceptional work! ${child.name} is almost through the full Math Mountain curriculum! 🏆`
            }
          </p>
        </div>
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
