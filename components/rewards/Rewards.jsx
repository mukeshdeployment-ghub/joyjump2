import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { play } from '../../lib/sounds'
import { fireConfetti } from '../../lib/confetti'
import { CelebrationCharacter } from '../characters/Character'

// ── FLYING STARS ─────────────────────────────────────────────────
export function FlyingStars({ count = 1, originX, originY, targetX, targetY }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[300]">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl"
          style={{ left: originX || '50%', top: originY || '50%' }}
          initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
          animate={{
            scale: [0, 1.5, 1.2, 0],
            opacity: [0, 1, 1, 0],
            x: [0, (Math.random() - 0.5) * 100, (targetX || 0) - (originX || 0)],
            y: [0, -(60 + Math.random() * 60), (targetY || -200) - (originY || 0)],
          }}
          transition={{ duration: 0.9, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          ⭐
        </motion.div>
      ))}
    </div>
  )
}

// ── MICRO FEEDBACK (correct/wrong) ────────────────────────────────
export function MicroFeedback({ type, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 8 }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[250] pointer-events-none"
        >
          <div className={`
            text-6xl flex flex-col items-center gap-2
            ${type === 'correct' ? 'text-green-500' : 'text-orange-400'}
          `}>
            <motion.span
              animate={{ rotate: type === 'correct' ? [0, -15, 15, 0] : [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {type === 'correct' ? '✅' : '💪'}
            </motion.span>
            <span className="font-fredoka text-2xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              {type === 'correct' ? 'Amazing!' : 'Try again!'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── FULL REWARD SCREEN ────────────────────────────────────────────
export function RewardScreen({ stars = 3, coins = 10, badge = null, character = 'max', onContinue }) {
  const [phase, setPhase] = useState(0)
  // phase 0: character, 1: stars, 2: coins, 3: badge, 4: button

  useEffect(() => {
    play('celebrate')
    fireConfetti('mega')
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => { setPhase(2); play('star') }, 800),
      setTimeout(() => { setPhase(3); play('star') }, 1200),
      setTimeout(() => setPhase(4), badge ? 1800 : 1400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="reward-overlay">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="bg-white rounded-4xl p-7 max-w-sm w-full text-center shadow-joy-xl relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 30%, #FFD700, transparent 60%)' }}
        />

        {/* Character celebration */}
        <div className="relative z-10">
          <CelebrationCharacter char={character} />
        </div>

        {/* Stars */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-3 my-4 relative z-10"
            >
              {[1, 2, 3].map((s) => (
                <motion.span
                  key={s}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: (s - 1) * 0.18, type: 'spring', damping: 8 }}
                  style={{ fontSize: 52, filter: s <= stars ? 'drop-shadow(0 0 8px #FFD700)' : 'grayscale(1) opacity(0.3)' }}
                >
                  ⭐
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coins */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="inline-flex items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-2.5 mb-3 relative z-10"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: 2 }}
                style={{ fontSize: 28 }}
              >🪙</motion.span>
              <span className="font-fredoka text-2xl text-amber-700">+{coins} coins!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        <AnimatePresence>
          {phase >= 3 && badge && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 8 }}
              className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-3 mb-3 relative z-10"
            >
              <p className="font-fredoka text-lg text-purple-700">🏅 New Badge!</p>
              <p className="font-nunito text-sm text-purple-500 font-semibold">{badge}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { play('tap'); onContinue() }}
              className="joy-btn joy-btn-orange w-full text-xl relative z-10 mt-2"
            >
              Keep Going! 🚀
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ── PROGRESS BAR ──────────────────────────────────────────────────
export function ProgressBar({ current, total, color = '#FB8C00', label }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between font-nunito text-xs font-bold text-gray-400 mb-1">
          <span>{label}</span>
          <span>{current}/{total}</span>
        </div>
      )}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  )
}

// ── STAR RATING ───────────────────────────────────────────────────
export function StarRating({ stars = 0, max = 3, size = 'md' }) {
  const sizes = { sm: 20, md: 28, lg: 40 }
  const s = sizes[size] || 28
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, type: 'spring' }}
          style={{ fontSize: s, filter: i < stars ? 'drop-shadow(0 0 4px #FFD700)' : 'grayscale(1) opacity(0.3)' }}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  )
}

// ── COIN DISPLAY ──────────────────────────────────────────────────
export function CoinDisplay({ coins }) {
  return (
    <motion.div
      className="inline-flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-1.5"
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-xl">🪙</span>
      <span className="font-fredoka text-lg text-amber-700">{coins}</span>
    </motion.div>
  )
}
