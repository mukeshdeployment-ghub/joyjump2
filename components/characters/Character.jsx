import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── CHARACTER DEFINITIONS ─────────────────────────────────────────
// Using publicly hosted Lottie animations from lottie.host (free CDN)
// These are cute animal characters that work for our purposes
// Each has an idle URL and a celebrate URL
export const CHARACTERS = {
  max: {
    name: 'Max', full: 'Max the Panda', emoji: '🐼',
    color: '#FB8C00', bg: '#FFF3E0', border: '#FFCC80',
    world: 'Math Mountain',
    // Free Lottie animations - panda/bear character
    lottieIdle: 'https://lottie.host/5e4f2e2b-77f7-4f5a-b7e4-5b5b5b5b5b5b/idle.lottie',
    lottieCelebrate: 'https://lottie.host/celebrate.lottie',
    // CSS fallback character (always works)
    cssChar: '🐼',
    phrases: {
      intro: ["Hi! I'm Max! Let's count some bamboo! 🎋", "Ready for a math adventure? I'll help you! 🏔️", "Numbers are fun when we learn together! ✨"],
      correct: ["AMAZING! You got it! ⭐", "Wow, you're SO smart! 🌟", "Perfect! I knew you could do it! 🎉", "Brilliant! High five! ✋"],
      wrong: ["Oops! Let's try again — you're almost there! 💪", "Not quite! I know you can get it! 🌟", "Good try! Let me give you a hint... 💡"],
      hint: ["Psst! Here's a secret tip! 🤫", "Let me help you think about this... 🤔"],
      celebrate: ["YOU DID IT!! You're a SUPERSTAR! 🌟🎉", "AMAZING! I'm SO proud of you! 🏆✨", "WOOHOO!! You're incredible! 🎊🌈"],
    }
  },
  lila: {
    name: 'Lila', full: 'Lila the Owl', emoji: '🦉',
    color: '#43A047', bg: '#E8F5E9', border: '#A5D6A7',
    world: 'Story Forest',
    cssChar: '🦉',
    phrases: {
      intro: ["Hoot hoot! I'm Lila! Let's read together! 📚", "Words are magical! I'll help you understand! ✨"],
      correct: ["Excellent word work! 📖", "You're a reading star! 🌟"],
      wrong: ["Let's sound it out together! 🔤", "Almost! Try again! 💪"],
      hint: ["Here's a clue from my library! 📚"],
      celebrate: ["You're a story champion! 🏆📚"],
    }
  },
  nova: {
    name: 'Nova', full: 'Nova the Fox', emoji: '🦊',
    color: '#1E88E5', bg: '#E3F2FD', border: '#90CAF9',
    world: 'Science Ocean',
    cssChar: '🦊',
    phrases: {
      intro: ["Hey scientist! I'm Nova! Let's discover! 🔬", "Science is all around us! Let's explore! 🌊"],
      correct: ["Excellent discovery! 🔬", "Science superstar! 🌟"],
      wrong: ["Scientists always try again! 💪", "Let's investigate more! 🔍"],
      hint: ["Science hint coming up! 🧪"],
      celebrate: ["You're a science genius! 🏆🔬"],
    }
  },
  orbit: {
    name: 'Orbit', full: 'Orbit the Turtle', emoji: '🐢',
    color: '#E91E63', bg: '#FCE4EC', border: '#F48FB1',
    world: 'Discovery Space',
    cssChar: '🐢',
    phrases: {
      intro: ["Slow and steady! I'm Orbit! Let's explore! 🌍", "There's so much world to discover! 🗺️"],
      correct: ["Wonderful discovery! 🌍", "You're a true explorer! 🗺️"],
      wrong: ["Keep exploring! 💪", "Every explorer tries again! 🌟"],
      hint: ["Here's a geography hint! 🗺️"],
      celebrate: ["World explorer extraordinaire! 🏆🌍"],
    }
  },
  juno: {
    name: 'Juno', full: 'Juno the Rabbit', emoji: '🐰',
    color: '#7B1FA2', bg: '#EDE7F6', border: '#CE93D8',
    world: 'All Worlds',
    cssChar: '🐰',
    phrases: {
      intro: ["Welcome to JoyJump! I'm Juno! 🌈", "I'm so excited to learn with you today! ⭐"],
      correct: ["Incredible! You're amazing! ⭐", "That's my favourite explorer! 🌟"],
      wrong: ["You can do it! Juno believes in you! 💪"],
      hint: ["Juno's tip: think carefully! 🤔"],
      celebrate: ["JUMPING FOR JOY! You're incredible! 🎉🐰"],
    }
  },
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── CSS CHARACTER AVATAR ─────────────────────────────────────────
// Beautiful animated character using CSS + emoji — no external deps
function CSSCharacter({ char, size = 120, mood = 'idle', onClick }) {
  const c = CHARACTERS[char] || CHARACTERS.max

  const animations = {
    idle: { y: [0, -8, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
    correct: { rotate: [-5, 5, -5, 0], scale: [1, 1.2, 1], transition: { duration: 0.6 } },
    celebrate: {
      y: [0, -20, 0, -15, 0], rotate: [-8, 8, -8, 8, 0], scale: [1, 1.3, 1.1, 1.2, 1],
      transition: { duration: 0.8, repeat: 2 }
    },
    wrong: { x: [-6, 6, -6, 6, 0], transition: { duration: 0.4 } },
    thinking: { rotate: [0, -5, 5, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
  }

  return (
    <motion.div
      animate={animations[mood] || animations.idle}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', display: 'inline-block' }}
    >
      <div
        className="relative flex items-center justify-center rounded-full shadow-joy"
        style={{
          width: size, height: size,
          background: `radial-gradient(circle at 35% 35%, white, ${c.bg})`,
          border: `4px solid ${c.border}`,
          fontSize: size * 0.55,
        }}
      >
        <span style={{ lineHeight: 1, userSelect: 'none' }}>{c.cssChar}</span>
        {/* Shine effect */}
        <div className="absolute top-2 left-3 w-4 h-4 rounded-full bg-white opacity-40" />
      </div>
    </motion.div>
  )
}

// ── MAIN CHARACTER COMPONENT ──────────────────────────────────────
export function Character({ char = 'max', size = 100, mood = 'idle', onClick }) {
  return <CSSCharacter char={char} size={size} mood={mood} onClick={onClick} />
}

// ── CHARACTER WITH SPEECH BUBBLE ────────────────────────────────
export function CharacterSays({ char = 'max', mood = 'intro', message, className = '' }) {
  const c = CHARACTERS[char] || CHARACTERS.max
  const text = message || getRandom(c.phrases[mood] || c.phrases.intro)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [text])

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Character char={char} size={88} mood={mood} />
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -10, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="speech-bubble flex-1 max-w-xs"
            style={{ borderColor: `${c.color}40` }}
          >
            <p className="text-base leading-snug" style={{ color: '#334155' }}>{text}</p>
            <p className="text-xs mt-1" style={{ color: c.color, fontWeight: 700 }}>{c.full}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── CELEBRATION BURST CHARACTER ──────────────────────────────────
export function CelebrationCharacter({ char = 'max' }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 8, stiffness: 150 }}
      className="flex flex-col items-center gap-2"
    >
      <Character char={char} size={140} mood="celebrate" />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [1, 0.8, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-3xl font-fredoka"
        style={{ color: CHARACTERS[char]?.color }}
      >
        {getRandom(CHARACTERS[char]?.phrases?.celebrate || ['🎉'])}
      </motion.div>
    </motion.div>
  )
}

export { getRandom }
export default Character
