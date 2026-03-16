import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useJoyStore } from '../../lib/store'
import { ProgressBar, StarRating } from '../../components/rewards/Rewards'
import { Character } from '../../components/characters/Character'
import { play } from '../../lib/sounds'
import mathData from '../../data/curriculum/math-mountain.json'

function getTopicStats(topic, progress) {
  let total = 0, done = 0
  topic.skills.forEach(sk => sk.lessons.forEach(l => {
    total++; if (progress[l.id]?.completed) done++
  }))
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

export default function MathMountain() {
  const { progress } = useJoyStore()
  const [openTopic, setOpenTopic] = useState(null)
  const [entered, setEntered] = useState(false)

  const totalLessons = mathData.topics.reduce((s, t) => s + t.skills.reduce((s2, sk) => s2 + sk.lessons.length, 0), 0)
  const doneLessons = Object.keys(progress).filter(k => k.startsWith('math-') && progress[k].completed).length

  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #FFF8DC 0%, #FFE0B2 40%, #FFF3E0 100%)' }}
    >
      {/* Hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="relative overflow-hidden pb-6 pt-4 px-4"
      >
        {/* Mountains backdrop */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: 80 }}>
          <svg viewBox="0 0 400 80" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
            <polygon points="0,80 60,20 120,80" fill="#FFCC80" opacity="0.5"/>
            <polygon points="80,80 160,10 240,80" fill="#FFB74D" opacity="0.6"/>
            <polygon points="200,80 280,25 360,80" fill="#FFA726" opacity="0.5"/>
            <polygon points="300,80 370,35 400,80" fill="#FFCC80" opacity="0.4"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 8, delay: 0.1 }}>
            <Character char="max" size={110} mood={entered ? 'idle' : 'correct'}
              onClick={() => { play('tap'); setEntered(true) }} />
          </motion.div>
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-fredoka text-4xl text-orange-700 text-center"
            style={{ textShadow: '0 2px 8px rgba(255,165,0,0.3)' }}>
            Math Mountain 🏔️
          </motion.h1>
          <p className="font-nunito text-orange-600 font-semibold text-center">
            Max the Panda is here to guide you! Tap Max to say hi!
          </p>
          <div className="w-full max-w-sm">
            <ProgressBar current={doneLessons} total={totalLessons}
              color="#FB8C00" label="Your mountain climb" />
          </div>
        </div>
      </motion.div>

      {/* Topics */}
      <div className="px-4 pb-24 flex flex-col gap-3 max-w-lg mx-auto">
        {mathData.topics.map((topic, i) => {
          const { total, done, pct } = getTopicStats(topic, progress)
          const isOpen = openTopic === topic.id

          return (
            <motion.div key={topic.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Topic header */}
              <button
                onClick={() => { play('tap'); setOpenTopic(isOpen ? null : topic.id) }}
                className="w-full text-left bg-white rounded-3xl shadow-joy p-4 flex items-center gap-4 hover:shadow-joy-lg transition-all"
                style={{ border: pct === 100 ? '2px solid #43A047' : '2px solid transparent' }}
              >
                <span style={{ fontSize: 42 }}>{topic.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-fredoka text-xl text-gray-800">{topic.title}</h2>
                    {pct === 100 && <span className="text-xl">✅</span>}
                  </div>
                  <p className="font-nunito text-xs text-gray-400 font-semibold">{topic.month} · {done}/{total} lessons</p>
                  <div className="mt-1.5">
                    <ProgressBar current={done} total={total || 1} color="#FB8C00" />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-fredoka text-lg text-orange-500 font-bold">{pct}%</span>
                  <motion.span className="text-gray-300 text-xl"
                    animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>▼</motion.span>
                </div>
              </button>

              {/* Expanded lessons */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="pt-2 pl-3 flex flex-col gap-2 pb-2">
                      {topic.skills.map(skill => (
                        <div key={skill.id}>
                          <p className="font-nunito text-xs font-bold text-gray-400 uppercase tracking-wide px-3 py-1">{skill.title}</p>
                          {skill.lessons.map(lesson => {
                            const lp = progress[lesson.id]
                            return (
                              <Link key={lesson.id} href={`/worlds/math/lesson/${lesson.id}`}>
                                <motion.div whileHover={{ x: 6, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                  onClick={() => play('tap')}
                                  className="flex items-center gap-3 bg-white rounded-2xl p-3.5 mb-1.5 shadow-sm cursor-pointer"
                                  style={{ border: lp?.completed ? '2px solid #A5D6A7' : '2px solid #F5F5F5' }}
                                >
                                  <span className="text-2xl flex-shrink-0">{lp?.completed ? '✅' : '📖'}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-nunito font-bold text-gray-700 text-sm leading-snug truncate">{lesson.title}</p>
                                    <p className="font-nunito text-xs text-gray-400 capitalize">{lesson.game?.type?.replace(/_/g, ' ')}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {lp?.completed && <StarRating stars={lp.score} max={3} size="sm" />}
                                    <span className="text-orange-400 font-bold">→</span>
                                  </div>
                                </motion.div>
                              </Link>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {/* Panda quote */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-orange-50 rounded-3xl p-5 text-center border-2 border-orange-100 mt-2">
          <span className="text-4xl">🐼</span>
          <p className="font-fredoka text-lg text-orange-700 mt-2">
            "Every lesson brings you closer to the top!"
          </p>
        </motion.div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t-2 border-orange-100 safe-bottom z-40">
        <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
          {[
            { href: '/', icon: '🌈', label: 'Map' },
            { href: '/worlds/math', icon: '🏔️', label: 'Math', active: true },
            { href: '/dashboard', icon: '📊', label: 'Progress' },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => play('tap')}
                className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl cursor-pointer ${item.active ? 'bg-orange-50' : ''}`}>
                <span className="text-2xl">{item.icon}</span>
                <span className={`font-baloo text-xs font-bold ${item.active ? 'text-orange-500' : 'text-gray-400'}`}>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
