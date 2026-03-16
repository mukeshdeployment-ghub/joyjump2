import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useJoyStore } from '../../lib/store'
import { ProgressBar, StarRating } from '../../components/rewards/Rewards'
import { Character } from '../../components/characters/Character'
import { play } from '../../lib/sounds'

const WORLD_THEMES = {
  story: {
    name: 'Story Forest', char: 'lila', emoji: '🌲',
    gradient: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 40%, #E8F5E9 100%)',
    headerGradient: 'linear-gradient(135deg, #43A047, #1B5E20)',
    color: '#43A047', border: '#A5D6A7', textColor: '#1B5E20',
    hintColor: '#E8F5E9', hintBorder: '#A5D6A7',
    activeNav: 'text-green-600', activeBg: 'bg-green-50',
    navBorder: 'border-green-100',
    mountain: null,
    quote: '"Every word you learn opens a new door!"',
    lessonPath: '/worlds/story/lesson',
  },
  science: {
    name: 'Science Ocean', char: 'nova', emoji: '🔬',
    gradient: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 40%, #E3F2FD 100%)',
    headerGradient: 'linear-gradient(135deg, #1E88E5, #0D47A1)',
    color: '#1E88E5', border: '#90CAF9', textColor: '#0D47A1',
    hintColor: '#E3F2FD', hintBorder: '#90CAF9',
    activeNav: 'text-blue-600', activeBg: 'bg-blue-50',
    navBorder: 'border-blue-100',
    quote: '"Science is curiosity in action!"',
    lessonPath: '/worlds/science/lesson',
  },
  hindi: {
    name: 'Hindi World', char: 'juno', emoji: '🏵️',
    gradient: 'linear-gradient(180deg, #FFF8E1 0%, #FFE082 20%, #FFF8E1 100%)',
    headerGradient: 'linear-gradient(135deg, #F57F17, #BF360C)',
    color: '#F57F17', border: '#FFD54F', textColor: '#BF360C',
    hintColor: '#FFF8E1', hintBorder: '#FFD54F',
    activeNav: 'text-amber-600', activeBg: 'bg-amber-50',
    navBorder: 'border-amber-100',
    quote: '"हिन्दी हमारी मातृभाषा है!"',
    lessonPath: '/worlds/hindi/lesson',
  },
  discovery: {
    name: 'Discovery Space', char: 'orbit', emoji: '🌍',
    gradient: 'linear-gradient(180deg, #FCE4EC 0%, #F8BBD0 20%, #FCE4EC 100%)',
    headerGradient: 'linear-gradient(135deg, #E91E63, #880E4F)',
    color: '#E91E63', border: '#F48FB1', textColor: '#880E4F',
    hintColor: '#FCE4EC', hintBorder: '#F48FB1',
    activeNav: 'text-pink-600', activeBg: 'bg-pink-50',
    navBorder: 'border-pink-100',
    quote: '"The world is your classroom!"',
    lessonPath: '/worlds/discovery/lesson',
  },
}

export default function WorldPage({ worldId, curriculumData }) {
  const theme = WORLD_THEMES[worldId] || WORLD_THEMES.story
  const { progress } = useJoyStore()
  const [openTopic, setOpenTopic] = useState(null)

  if (!curriculumData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.gradient }}>
        <div className="text-center p-8">
          <div style={{ fontSize: 80 }}>{theme.emoji}</div>
          <h1 className="font-fredoka text-3xl mt-4" style={{ color: theme.textColor }}>
            {theme.name}
          </h1>
          <p className="font-nunito text-gray-500 mt-2">Coming soon! Keep earning stars! ⭐</p>
          <Link href="/">
            <button className="joy-btn mt-6 text-base py-3 px-6"
              style={{ background: theme.headerGradient }}>
              ← Back to Map
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const totalLessons = curriculumData.topics.reduce(
    (s, t) => s + t.skills.reduce((s2, sk) => s2 + sk.lessons.length, 0), 0
  )
  const doneLessons = Object.keys(progress).filter(
    k => k.startsWith(`${worldId.substring(0, 3)}-`) && progress[k].completed
  ).length

  return (
    <div className="min-h-screen" style={{ background: theme.gradient }}>
      {/* Hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="relative overflow-hidden pb-4 pt-4 px-4"
        style={{ background: theme.headerGradient }}
      >
        <div className="flex flex-col items-center gap-3 max-w-lg mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 8, delay: 0.1 }}>
            <Character char={theme.char} size={100} mood="idle" />
          </motion.div>
          <h1 className="font-fredoka text-3xl text-white text-center">{theme.name}</h1>
          <p className="font-nunito text-white/70 text-sm font-semibold text-center">
            {curriculumData.description}
          </p>
          <div className="w-full max-w-sm">
            <ProgressBar current={doneLessons} total={totalLessons}
              color="rgba(255,255,255,0.8)" label="Your progress" />
          </div>
        </div>
      </motion.div>

      {/* Topics */}
      <div className="px-4 pt-4 pb-24 flex flex-col gap-3 max-w-lg mx-auto">
        {curriculumData.topics.map((topic, i) => {
          let total = 0, done = 0
          topic.skills.forEach(sk => sk.lessons.forEach(l => {
            total++; if (progress[l.id]?.completed) done++
          }))
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          const isOpen = openTopic === topic.id

          return (
            <motion.div key={topic.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <button onClick={() => { play('tap'); setOpenTopic(isOpen ? null : topic.id) }}
                className="w-full text-left bg-white rounded-3xl shadow-joy p-4 flex items-center gap-4 hover:shadow-joy-lg transition-all"
                style={{ border: pct === 100 ? `2px solid ${theme.color}` : '2px solid transparent' }}
              >
                <span style={{ fontSize: 40 }}>{topic.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-fredoka text-lg text-gray-800">{topic.title}</h2>
                    {pct === 100 && <span className="text-lg">✅</span>}
                  </div>
                  <p className="font-nunito text-xs text-gray-400 font-semibold">{topic.month} · {done}/{total}</p>
                  <div className="mt-1.5">
                    <ProgressBar current={done} total={total || 1} color={theme.color} />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-fredoka text-base font-bold" style={{ color: theme.color }}>{pct}%</span>
                  <motion.span className="text-gray-300 text-xl"
                    animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>▼</motion.span>
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="pt-2 pl-3 flex flex-col gap-1.5 pb-2">
                      {topic.skills.map(skill => (
                        <div key={skill.id}>
                          <p className="font-nunito text-xs font-bold text-gray-400 uppercase tracking-wide px-3 py-0.5">{skill.title}</p>
                          {skill.lessons.map(lesson => {
                            const lp = progress[lesson.id]
                            return (
                              <Link key={lesson.id} href={`${theme.lessonPath}/${lesson.id}`}>
                                <motion.div whileHover={{ x: 6, scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                  onClick={() => play('tap')}
                                  className="flex items-center gap-3 bg-white rounded-2xl p-3.5 mb-1 shadow-sm cursor-pointer"
                                  style={{ border: lp?.completed ? `2px solid ${theme.border}` : '2px solid #F5F5F5' }}
                                >
                                  <span className="text-xl flex-shrink-0">{lp?.completed ? '✅' : '📖'}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-nunito font-bold text-gray-700 text-sm leading-snug truncate">{lesson.title}</p>
                                    <p className="font-nunito text-xs text-gray-400 capitalize">{lesson.game?.type?.replace(/_/g, ' ')}</p>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {lp?.completed && <StarRating stars={lp.score} max={3} size="sm" />}
                                    <span className="font-bold" style={{ color: theme.color }}>→</span>
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

        {/* Character quote */}
        <div className="rounded-3xl p-5 text-center border-2 mt-2"
          style={{ background: theme.hintColor, borderColor: theme.hintBorder }}>
          <div style={{ fontSize: 40 }}>
            {theme.char === 'lila' ? '🦉' : theme.char === 'nova' ? '🦊' : theme.char === 'juno' ? '🐰' : '🐢'}
          </div>
          <p className="font-fredoka text-lg mt-2" style={{ color: theme.textColor }}>
            {theme.quote}
          </p>
        </div>
      </div>

      {/* Bottom nav */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t-2 ${theme.navBorder} safe-bottom z-40`}>
        <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
          {[
            { href: '/', icon: '🌈', label: 'Map' },
            { href: `/worlds/${worldId}`, icon: theme.emoji, label: theme.name.split(' ')[0], active: true },
            { href: '/dashboard', icon: '📊', label: 'Progress' },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => play('tap')}
                className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl cursor-pointer ${item.active ? theme.activeBg : ''}`}>
                <span className="text-2xl">{item.icon}</span>
                <span className={`font-baloo text-xs font-bold ${item.active ? theme.activeNav : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
