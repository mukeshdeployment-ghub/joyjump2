import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJoyStore } from '../lib/store'
import { play } from '../lib/sounds'
import { Character } from './characters/Character'

const STEPS = ['welcome', 'name', 'avatar', 'ready']

const AVATARS = [
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'rabbit', emoji: '🐰', label: 'Bunny' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('panda')
  const { setChild } = useJoyStore()

  const currentStep = STEPS[step]

  const handleNext = () => {
    play('tap')
    if (step < STEPS.length - 1) setStep(s => s + 1)
  }

  const handleFinish = () => {
    play('celebrate')
    setChild({ name: name.trim() || 'Explorer', avatar, grade: 3 })
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #87CEEB 0%, #B8DEF5 40%, #E8F5E9 100%)',
      }}
    >
      {/* Floating background elements */}
      {['⭐','🌟','✨','💫','🌈'].map((e, i) => (
        <motion.span key={i}
          className="fixed text-3xl pointer-events-none select-none"
          style={{ left: `${8 + i * 18}%`, top: `${5 + (i % 3) * 12}%`, opacity: 0.35 }}
          animate={{ y: [0, -14, 0], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 3 + i * 0.7, repeat: Infinity, delay: i * 0.5 }}
        >{e}</motion.span>
      ))}

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14 }}
        className="bg-white rounded-4xl shadow-joy-xl p-8 max-w-sm w-full text-center relative overflow-hidden"
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-4xl"
          style={{ background: 'linear-gradient(90deg, #A7D8FF, #B8F2E6, #FFD6A5, #CDB4DB, #A7D8FF)', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' }} />

        <AnimatePresence mode="wait">

          {/* STEP 0: Welcome */}
          {currentStep === 'welcome' && (
            <motion.div key="welcome"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-5"
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <Character char="juno" size={130} mood="idle" />
              </motion.div>
              <div>
                <h1 className="font-fredoka text-4xl text-orange-600 mb-2">Welcome to JoyJump! 🌈</h1>
                <p className="font-nunito text-gray-500 text-lg leading-relaxed">
                  Hi! I'm Juno! I'll be your guide through this magical learning universe!
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="joy-btn joy-btn-orange w-full text-xl"
              >
                Let's get started! 🚀
              </motion.button>
            </motion.div>
          )}

          {/* STEP 1: Enter name */}
          {currentStep === 'name' && (
            <motion.div key="name"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-5"
            >
              <motion.span style={{ fontSize: 80 }} animate={{ rotate: [-5, 5, -5, 0] }} transition={{ duration: 0.8, delay: 0.3 }}>
                👋
              </motion.span>
              <div>
                <h2 className="font-fredoka text-3xl text-purple-600 mb-2">What's your name?</h2>
                <p className="font-nunito text-gray-400 text-base">I want to cheer for you by name!</p>
              </div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name.trim() && handleNext()}
                placeholder="Type your name..."
                autoFocus
                maxLength={20}
                className="w-full text-center text-2xl font-fredoka py-4 px-6 rounded-2xl border-4 border-purple-200 focus:border-purple-400 outline-none bg-purple-50 text-purple-700 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!name.trim()}
                className={`joy-btn w-full text-xl ${!name.trim() ? 'opacity-40' : ''}`}
                style={{ background: 'linear-gradient(135deg, #7B1FA2, #4A148C)' }}
              >
                That's me! ✨
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2: Choose avatar */}
          {currentStep === 'avatar' && (
            <motion.div key="avatar"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-5"
            >
              <h2 className="font-fredoka text-3xl text-blue-600">
                Hi, {name}! 👋
              </h2>
              <p className="font-nunito text-gray-500 text-base">Pick your favourite friend!</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {AVATARS.map(av => (
                  <motion.button
                    key={av.id}
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    onClick={() => { play('tap'); setAvatar(av.id) }}
                    className="flex flex-col items-center gap-2 py-4 rounded-3xl border-4 transition-all"
                    style={{
                      background: avatar === av.id ? '#E3F2FD' : '#F9FAFB',
                      borderColor: avatar === av.id ? '#1E88E5' : '#E5E7EB',
                      boxShadow: avatar === av.id ? '0 0 0 3px rgba(30,136,229,0.2)' : 'none',
                    }}
                  >
                    <motion.span
                      style={{ fontSize: 52 }}
                      animate={avatar === av.id ? { y: [0, -6, 0] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {av.emoji}
                    </motion.span>
                    <span className="font-baloo font-bold text-sm text-gray-600">{av.label}</span>
                    {avatar === av.id && (
                      <span className="text-blue-500 font-bold text-xs">✓ Selected!</span>
                    )}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="joy-btn joy-btn-blue w-full text-xl"
              >
                This one! →
              </motion.button>
            </motion.div>
          )}

          {/* STEP 3: Ready! */}
          {currentStep === 'ready' && (
            <motion.div key="ready"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span style={{ fontSize: 100 }}>
                  {AVATARS.find(a => a.id === avatar)?.emoji || '🌟'}
                </span>
              </motion.div>
              <div>
                <h2 className="font-fredoka text-4xl text-orange-600 mb-1">
                  You're all set, {name}! 🎉
                </h2>
                <p className="font-nunito text-gray-500 text-lg">
                  Your learning universe is ready! Let's go explore!
                </p>
              </div>
              {/* Stars earned just for signing up */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', damping: 8 }}
                className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-2.5"
              >
                <span style={{ fontSize: 28 }}>🎁</span>
                <span className="font-fredoka text-xl text-amber-700">+5 welcome stars!</span>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleFinish}
                className="joy-btn joy-btn-orange w-full text-2xl py-5"
              >
                Start Adventure! 🌈
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-5">
          {STEPS.map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full transition-all"
              style={{ background: i <= step ? '#FB8C00' : '#E5E7EB', transform: i === step ? 'scale(1.3)' : 'scale(1)' }} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
