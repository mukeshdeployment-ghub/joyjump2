import { motion } from 'framer-motion'
import Link from 'next/link'
import { play } from '../lib/sounds'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(135deg, #87CEEB 0%, #B8DEF5 50%, #E8F5E9 100%)' }}
    >
      {/* Floating clouds */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="bg-white rounded-4xl shadow-joy-xl p-10 max-w-sm w-full"
      >
        {/* Lost panda */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-4, 4, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 96, lineHeight: 1 }}
        >
          🐼
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-fredoka text-5xl text-orange-500 mt-4"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-fredoka text-2xl text-gray-700 mt-2"
        >
          Oops! Max got lost! 🏔️
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="font-nunito text-gray-400 text-base mt-2 leading-relaxed"
        >
          This page doesn't exist — but your learning adventure does!
        </motion.p>

        {/* Stars decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
          className="flex justify-center gap-3 my-5"
        >
          {['⭐', '🌟', '✨'].map((s, i) => (
            <motion.span
              key={i}
              style={{ fontSize: 32 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            >
              {s}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Link href="/">
            <button
              onClick={() => play('tap')}
              className="joy-btn joy-btn-orange w-full text-xl"
            >
              Back to JoyJump! 🌈
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
