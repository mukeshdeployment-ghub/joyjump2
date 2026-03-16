import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useJoyStore } from '../../lib/store'
import { play } from '../../lib/sounds'

const WORLDS = [
  {
    id: 'math', label: 'Math Mountain', emoji: '🏔️', char: '🐼',
    color: '#FB8C00', glow: '#FFCC02', textColor: '#E65100',
    bg: 'linear-gradient(145deg, #FFF3E0, #FFE0B2)',
    border: '#FFCC80',
    href: '/worlds/math', always: true,
    desc: 'Numbers, shapes & patterns!',
    // Position on the map (percentage)
    x: 28, y: 52,
    // SVG mountain shape points
    shape: 'mountain',
  },
  {
    id: 'story', label: 'Story Forest', emoji: '🌲', char: '🦉',
    color: '#43A047', glow: '#69F0AE', textColor: '#1B5E20',
    bg: 'linear-gradient(145deg, #E8F5E9, #C8E6C9)',
    border: '#A5D6A7',
    href: '/worlds/story', requiredStars: 20,
    desc: 'English grammar & stories!',
    x: 68, y: 42,
    shape: 'forest',
  },
  {
    id: 'science', label: 'Science Ocean', emoji: '🔬', char: '🦊',
    color: '#1E88E5', glow: '#40C4FF', textColor: '#0D47A1',
    bg: 'linear-gradient(145deg, #E3F2FD, #BBDEFB)',
    border: '#90CAF9',
    href: '/worlds/science', requiredStars: 40,
    desc: 'Animals, plants & beyond!',
    x: 18, y: 72,
    shape: 'ocean',
  },
  {
    id: 'discovery', label: 'Discovery Space', emoji: '🌍', char: '🐢',
    color: '#E91E63', glow: '#FF4081', textColor: '#880E4F',
    bg: 'linear-gradient(145deg, #FCE4EC, #F8BBD0)',
    border: '#F48FB1',
    href: '/worlds/discovery', requiredStars: 60,
    desc: 'India, continents & history!',
    x: 55, y: 68,
    shape: 'globe',
  },
  {
    id: 'hindi', label: 'Hindi World', emoji: '🏵️', char: '🐰',
    color: '#F57F17', glow: '#FFAB40', textColor: '#BF360C',
    bg: 'linear-gradient(145deg, #FFF8E1, #FFECB3)',
    border: '#FFD54F',
    href: '/worlds/hindi', requiredStars: 30,
    desc: 'Hindi grammar & stories!',
    x: 82, y: 62,
    shape: 'lotus',
  },
  {
    id: 'creativity', label: 'Creativity Island', emoji: '🎨', char: '🌟',
    color: '#7B1FA2', glow: '#EA80FC', textColor: '#4A148C',
    bg: 'linear-gradient(145deg, #EDE7F6, #D1C4E9)',
    border: '#CE93D8',
    href: '/worlds/creativity', requiredStars: 80,
    desc: 'Art, music & imagination!',
    x: 42, y: 82,
    shape: 'island',
  },
]

// Individual world island component
function WorldIsland({ world, isUnlocked, stars, onSelect, isSelected }) {
  const starsNeeded = world.requiredStars || 0
  const progress = isUnlocked ? 100 : Math.min(100, Math.round((stars / starsNeeded) * 100))

  return (
    <motion.div
      className="absolute"
      style={{ left: `${world.x}%`, top: `${world.y}%`, transform: 'translate(-50%, -50%)' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 12, delay: 0.1 }}
    >
      <motion.button
        whileHover={isUnlocked ? { scale: 1.12, y: -6 } : { scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
        animate={isSelected ? { scale: 1.15, y: -8 } : { scale: 1 }}
        onClick={() => {
          play('tap')
          onSelect(world)
        }}
        className="relative flex flex-col items-center gap-1 focus:outline-none"
        style={{ filter: isUnlocked ? 'none' : 'saturate(0.3) brightness(0.85)' }}
      >
        {/* Glow ring when unlocked */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: `radial-gradient(circle, ${world.glow}60 0%, transparent 70%)`, width: '100%', height: '100%', top: 0, left: 0 }}
          />
        )}

        {/* Island bubble */}
        <div
          className="relative flex items-center justify-center rounded-3xl shadow-world transition-shadow"
          style={{
            width: 90, height: 90,
            background: world.bg,
            border: `3px solid ${world.border}`,
            boxShadow: isSelected
              ? `0 0 0 4px white, 0 0 0 7px ${world.color}, 0 16px 40px rgba(0,0,0,0.25)`
              : `0 8px 24px rgba(0,0,0,0.18)`,
          }}
        >
          <span style={{ fontSize: 42, lineHeight: 1 }}>{world.emoji}</span>

          {/* Character guide peek */}
          <div
            className="absolute -bottom-3 -right-3 flex items-center justify-center rounded-full border-2 border-white shadow"
            style={{ width: 32, height: 32, background: world.bg, fontSize: 18 }}
          >
            {world.char}
          </div>

          {/* Lock icon */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/50">
              <span style={{ fontSize: 28 }}>🔒</span>
            </div>
          )}
        </div>

        {/* World label */}
        <div
          className="px-3 py-1 rounded-xl text-center shadow"
          style={{
            background: 'white',
            border: `2px solid ${world.border}`,
            maxWidth: 110,
          }}
        >
          <p className="font-fredoka text-xs leading-tight" style={{ color: world.textColor, fontWeight: 600, fontSize: 11 }}>
            {world.label}
          </p>
          {!isUnlocked && (
            <p className="text-gray-400" style={{ fontSize: 9, fontWeight: 600 }}>
              ⭐ {starsNeeded} to unlock
            </p>
          )}
        </div>

        {/* Stars progress bar */}
        {!isUnlocked && progress > 0 && (
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: world.color }}
            />
          </div>
        )}
      </motion.button>
    </motion.div>
  )
}

// Info card that appears when a world is tapped
function WorldInfoCard({ world, isUnlocked, onGo, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 15 }}
      className="fixed bottom-24 left-4 right-4 z-50 rounded-3xl p-5 shadow-joy-xl"
      style={{ background: world.bg, border: `3px solid ${world.border}`, maxWidth: 440, margin: '0 auto' }}
    >
      <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 text-2xl">×</button>
      <div className="flex items-center gap-4 mb-3">
        <span style={{ fontSize: 56 }}>{world.emoji}</span>
        <div>
          <h3 className="font-fredoka text-2xl" style={{ color: world.textColor }}>{world.label}</h3>
          <p className="font-nunito text-sm text-gray-500">{world.char} {world.desc}</p>
        </div>
      </div>

      {isUnlocked ? (
        <button
          onClick={onGo}
          className="joy-btn joy-btn-orange w-full text-lg"
          style={{ background: `linear-gradient(135deg, ${world.color}, ${world.textColor})` }}
        >
          Enter World! ➜
        </button>
      ) : (
        <div className="text-center py-2">
          <p className="font-baloo font-bold text-gray-500">
            Earn {world.requiredStars} ⭐ stars to unlock this world
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default function WorldMap() {
  const { stars, coins, unlockedWorlds, child, streak } = useJoyStore()
  const [selected, setSelected] = useState(null)
  const router = useRouter()

  const handleSelect = (world) => {
    setSelected(prev => prev?.id === world.id ? null : world)
  }

  const handleGo = () => {
    if (selected) {
      play('gameStart')
      router.push(selected.href)
    }
  }

  return (
    <div className="world-map-scene min-h-screen">
      {/* Drifting clouds */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />

      {/* Decorative sun */}
      <motion.div
        className="absolute top-6 right-8 text-6xl pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ filter: 'drop-shadow(0 0 20px rgba(255,220,0,0.6))' }}
      >
        ☀️
      </motion.div>

      {/* Floating sparkles */}
      {['✨', '⭐', '✨', '💫', '⭐'].map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-xl pointer-events-none"
          style={{ left: `${15 + i * 18}%`, top: `${10 + (i % 3) * 8}%`, opacity: 0.5 }}
          animate={{ y: [0, -12, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        >
          {s}
        </motion.div>
      ))}

      {/* Top HUD */}
      <div className="relative z-10 flex justify-between items-center px-4 pt-4 pb-2">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-2xl px-4 py-2 shadow"
        >
          <span className="text-2xl">👧</span>
          <div>
            <p className="font-fredoka text-lg leading-none" style={{ color: '#E65100' }}>Hi, {child.name}!</p>
            {streak > 0 && <p className="font-nunito text-xs text-orange-400 font-bold">🔥 {streak} day streak!</p>}
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-1.5 shadow">
            <span className="text-xl">⭐</span>
            <span className="font-fredoka text-xl text-amber-700">{stars}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-3 py-1.5 shadow">
            <span className="text-xl">🪙</span>
            <span className="font-fredoka text-xl text-yellow-700">
              {coins}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Map title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center py-2 relative z-10"
      >
        <h1 className="font-fredoka text-3xl" style={{ color: '#1a3a5c', textShadow: '0 2px 8px rgba(255,255,255,0.8)' }}>
          🌈 JoyJump Universe
        </h1>
        <p className="font-nunito text-sm font-semibold text-sky-600">Tap a world to begin your adventure!</p>
      </motion.div>

      {/* World islands — the actual map */}
      <div className="relative" style={{ height: 'calc(100vh - 160px)', minHeight: 480 }}>
        {/* Decorative path between worlds */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4">
              <circle cx="5" cy="5" r="4" fill="rgba(255,255,255,0.6)" />
            </marker>
          </defs>
          {/* Dotted paths between worlds */}
          <path
            d="M 28% 52% Q 48% 35% 68% 42%"
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3"
            strokeDasharray="8 6" markerMid="url(#dot)"
          />
          <path
            d="M 28% 52% Q 20% 65% 18% 72%"
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3"
            strokeDasharray="8 6"
          />
          <path
            d="M 68% 42% Q 75% 55% 82% 62%"
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3"
            strokeDasharray="8 6"
          />
          <path
            d="M 18% 72% Q 35% 78% 55% 68%"
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3"
            strokeDasharray="8 6"
          />
          <path
            d="M 55% 68% Q 48% 78% 42% 82%"
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3"
            strokeDasharray="8 6"
          />
        </svg>

        {WORLDS.map((world) => {
          const isUnlocked = world.always || unlockedWorlds.includes(world.id)
          return (
            <WorldIsland
              key={world.id}
              world={world}
              isUnlocked={isUnlocked}
              stars={stars}
              onSelect={handleSelect}
              isSelected={selected?.id === world.id}
            />
          )
        })}
      </div>

      {/* World info card */}
      <AnimatePresence>
        {selected && (
          <WorldInfoCard
            world={selected}
            isUnlocked={selected.always || unlockedWorlds.includes(selected.id)}
            onGo={handleGo}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t-2 border-sky-100 safe-bottom z-40">
        <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
          {[
            { href: '/', icon: '🌈', label: 'Home' },
            { href: '/worlds', icon: '🗺️', label: 'Map' },
            { href: '/dashboard', icon: '📊', label: 'Progress' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl cursor-pointer"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-baloo text-xs font-bold text-gray-400">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
