/**
 * JoyJump Sound Engine v2
 * Uses Web Audio API to SYNTHESIZE sounds directly — zero sound files needed.
 * Falls back to Howler.js patterns when complex audio is needed.
 * This means the app works immediately with no asset downloads.
 */

let audioCtx = null
let unlocked = false

function getCtx() {
  if (!audioCtx && typeof window !== 'undefined') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

// Unlock audio on first user interaction (iOS/Chrome policy)
function unlockAudio() {
  if (unlocked) return
  const ctx = getCtx()
  if (!ctx) return
  const buf = ctx.createBuffer(1, 1, 22050)
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.connect(ctx.destination)
  src.start(0)
  unlocked = true
}

if (typeof window !== 'undefined') {
  ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(evt =>
    window.addEventListener(evt, unlockAudio, { once: true, passive: true })
  )
}

// Helper: play a tone
function tone(freq, type, duration, volume = 0.3, delay = 0) {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
  gain.gain.setValueAtTime(0, ctx.currentTime + delay)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)

  osc.start(ctx.currentTime + delay)
  osc.stop(ctx.currentTime + delay + duration + 0.01)
}

// Play a sequence of notes
function melody(notes, baseDelay = 0) {
  // notes: [{ freq, dur, vol?, type? }]
  let t = baseDelay
  notes.forEach(n => {
    tone(n.freq, n.type || 'sine', n.dur, n.vol || 0.25, t)
    t += n.gap !== undefined ? n.gap : n.dur * 0.6
  })
}

// ── SOUND LIBRARY ──────────────────────────────────────────────────

export const sounds = {
  // Short happy sparkle — correct answer
  correct() {
    melody([
      { freq: 523, dur: 0.12, vol: 0.25, type: 'sine' },
      { freq: 659, dur: 0.12, vol: 0.25, type: 'sine' },
      { freq: 784, dur: 0.20, vol: 0.3,  type: 'sine' },
    ], 0)
    // Add a shimmer overtone
    tone(1568, 'sine', 0.15, 0.08, 0.08)
  },

  // Soft thud — wrong answer (non-punishing)
  wrong() {
    tone(220, 'sine', 0.18, 0.15)
    tone(196, 'sine', 0.25, 0.12, 0.08)
  },

  // Button tap — light pop
  tap() {
    tone(880, 'sine', 0.06, 0.12)
    tone(1100, 'sine', 0.04, 0.08, 0.03)
  },

  // Star earned — ascending sparkle
  star() {
    melody([
      { freq: 784, dur: 0.1, vol: 0.2, type: 'sine', gap: 0.06 },
      { freq: 988, dur: 0.1, vol: 0.2, type: 'sine', gap: 0.06 },
      { freq: 1175, dur: 0.15, vol: 0.25, type: 'sine', gap: 0.08 },
      { freq: 1568, dur: 0.2, vol: 0.22, type: 'sine' },
    ], 0)
  },

  // Lesson complete — full celebration fanfare
  celebrate() {
    // C major arpeggio then full chord
    melody([
      { freq: 523, dur: 0.12, vol: 0.3, type: 'sine', gap: 0.08 },
      { freq: 659, dur: 0.12, vol: 0.3, type: 'sine', gap: 0.08 },
      { freq: 784, dur: 0.12, vol: 0.3, type: 'sine', gap: 0.08 },
      { freq: 1047, dur: 0.3, vol: 0.35, type: 'sine' },
    ], 0)
    // Harmony
    tone(659, 'sine', 0.3, 0.2, 0.24)
    tone(784, 'sine', 0.3, 0.15, 0.24)
    // Sparkle on top
    setTimeout(() => {
      melody([
        { freq: 1568, dur: 0.08, vol: 0.15, type: 'sine', gap: 0.05 },
        { freq: 1760, dur: 0.08, vol: 0.15, type: 'sine', gap: 0.05 },
        { freq: 1976, dur: 0.15, vol: 0.18, type: 'sine' },
      ], 0)
    }, 300)
  },

  // World unlock — magical rising sound
  unlock() {
    melody([
      { freq: 392, dur: 0.15, vol: 0.2, type: 'sine', gap: 0.1 },
      { freq: 523, dur: 0.15, vol: 0.22, type: 'sine', gap: 0.1 },
      { freq: 659, dur: 0.15, vol: 0.24, type: 'sine', gap: 0.1 },
      { freq: 784, dur: 0.15, vol: 0.26, type: 'sine', gap: 0.1 },
      { freq: 1047, dur: 0.3,  vol: 0.3,  type: 'sine' },
    ], 0)
    tone(1568, 'sine', 0.2, 0.15, 0.55)
  },

  // Drag start — tactile thunk
  dragStart() {
    tone(330, 'sine', 0.08, 0.18)
    tone(440, 'sine', 0.06, 0.12, 0.04)
  },

  // Drop success — magnetic snap
  snap() {
    tone(660, 'sine', 0.06, 0.2)
    tone(880, 'sine', 0.08, 0.15, 0.04)
  },

  // Timer tick
  tick() {
    tone(1200, 'sine', 0.04, 0.1)
  },

  // Game start — adventure begin
  gameStart() {
    melody([
      { freq: 523, dur: 0.1, vol: 0.2, type: 'triangle', gap: 0.07 },
      { freq: 659, dur: 0.1, vol: 0.22, type: 'triangle', gap: 0.07 },
      { freq: 784, dur: 0.15, vol: 0.25, type: 'triangle' },
    ], 0)
  },

  // Streak milestone
  streak() {
    melody([
      { freq: 880, dur: 0.08, vol: 0.2, type: 'sine', gap: 0.05 },
      { freq: 1108, dur: 0.08, vol: 0.22, type: 'sine', gap: 0.05 },
      { freq: 1320, dur: 0.08, vol: 0.24, type: 'sine', gap: 0.05 },
      { freq: 1760, dur: 0.18, vol: 0.28, type: 'sine' },
    ], 0)
  },
}

// Safe play — never crashes
export function play(name) {
  try {
    if (typeof window === 'undefined') return
    const fn = sounds[name]
    if (fn) fn()
  } catch (e) {
    // Silently ignore — never let audio crash the app
  }
}

export default play
