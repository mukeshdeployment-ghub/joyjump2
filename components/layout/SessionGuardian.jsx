import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJoyStore } from '../../lib/store'
import { play } from '../../lib/sounds'

// ── Configuration ────────────────────────────────────────────────
const SESSION_LIMIT_MINUTES = 20
const WARNING_AT_MINUTES    = 17   // show "3 minutes left" nudge
const SESSION_LIMIT_MS      = SESSION_LIMIT_MINUTES * 60 * 1000

// ── Break Screen ─────────────────────────────────────────────────
function BreakScreen({ minutesPlayed, onResume }) {
  const [canResume, setCanResume] = useState(false)
  const [countdown, setCountdown] = useState(120) // 2-minute minimum break

  useEffect(() => {
    play('celebrate') // gentle chime, not jarring
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(t)
          setCanResume(true)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0')
  const ss = String(countdown % 60).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'linear-gradient(180deg, #87CEEB 0%, #B8DEF5 50%, #E8F5E9 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center',
      }}
    >
      {/* Animated character taking a break */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 96, marginBottom: 8 }}
      >
        🌟
      </motion.div>

      {/* Stars floating around */}
      {['⭐', '✨', '💫', '⭐', '✨'].map((s, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            fontSize: 28,
            left: `${12 + i * 18}%`,
            top: `${10 + (i % 3) * 12}%`,
            opacity: 0.5,
          }}
          animate={{ y: [0, -12, 0], rotate: [0, 20, -20, 0] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
        >{s}</motion.span>
      ))}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'white', borderRadius: 32, padding: '40px 36px',
          maxWidth: 360, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 32, color: '#E65100', margin: '0 0 8px' }}>
          Amazing work! 🎉
        </h2>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, color: '#555', margin: '0 0 4px' }}>
          You've been learning for <strong>{minutesPlayed} minutes</strong>!
        </p>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, color: '#888', margin: '0 0 24px' }}>
          Time to rest your eyes, have some water,<br />and stretch a little! 💧
        </p>

        {/* Break tip */}
        <div style={{
          background: '#E3F2FD', borderRadius: 16, padding: '12px 16px', marginBottom: 24,
          fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#1565C0', fontWeight: 600,
        }}>
          💡 Tip: Look at something far away for 20 seconds — it rests your eyes!
        </div>

        {!canResume ? (
          <div>
            <p style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: 15, color: '#888', marginBottom: 8 }}>
              Come back in
            </p>
            <div style={{
              fontFamily: 'Fredoka, sans-serif', fontSize: 48, color: '#1E88E5',
              background: '#E3F2FD', borderRadius: 16, padding: '8px 24px',
              display: 'inline-block',
            }}>
              {mm}:{ss}
            </div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#aaa', marginTop: 8 }}>
              Minimum 2-minute break
            </p>
          </div>
        ) : (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { play('tap'); onResume() }}
            style={{
              background: 'linear-gradient(135deg, #FB8C00, #E65100)',
              color: 'white', border: 'none', borderRadius: 20,
              padding: '16px 40px', fontSize: 20,
              fontFamily: 'Baloo 2, sans-serif', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 6px 20px rgba(251,140,0,0.4)',
              width: '100%',
            }}
          >
            I'm ready to learn more! 🚀
          </motion.button>
        )}
      </motion.div>

      {/* Progress bar for break timer */}
      {!canResume && (
        <div style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.4)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              style={{
                height: '100%', background: 'white', borderRadius: 4,
                transformOrigin: 'left',
              }}
              initial={{ width: '100%' }}
              animate={{ width: `${(countdown / 120) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── Warning Nudge (shown at 17 minutes) ──────────────────────────
function SessionWarning({ minutesLeft, onDismiss }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      style={{
        position: 'fixed', bottom: 90, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
        border: '2px solid #FFCC80',
        borderRadius: 20, padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        maxWidth: 320, width: 'calc(100% - 32px)',
      }}
    >
      <span style={{ fontSize: 28, flexShrink: 0 }}>⏰</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 16, color: '#E65100', margin: 0 }}>
          {minutesLeft} minutes left!
        </p>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#888', margin: 0 }}>
          Finish your current lesson and then take a break!
        </p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 18, color: '#aaa', padding: 4, flexShrink: 0,
        }}
      >
        ✕
      </button>
    </motion.div>
  )
}

// ── Main Guardian Hook ────────────────────────────────────────────
export function useSessionGuardian() {
  const { startSession, tickSession, endSession, totalMinutesToday } = useJoyStore()
  const [showBreak, setShowBreak] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningDismissed, setWarningDismissed] = useState(false)
  const [sessionMinutes, setSessionMinutes] = useState(0)
  const startTime = useRef(null)
  const tickRef   = useRef(null)

  const startGuardian = useCallback(() => {
    startTime.current = Date.now()
    startSession()

    tickRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 60000)
      setSessionMinutes(elapsed)
      tickSession()

      // Show warning at WARNING_AT_MINUTES
      if (elapsed >= WARNING_AT_MINUTES && !warningDismissed && !showBreak) {
        setShowWarning(true)
      }

      // Force break at SESSION_LIMIT_MINUTES
      if (elapsed >= SESSION_LIMIT_MINUTES) {
        setShowBreak(true)
        setShowWarning(false)
        clearInterval(tickRef.current)
      }
    }, 60000) // check every minute
  }, [startSession, tickSession, warningDismissed, showBreak])

  const stopGuardian = useCallback(() => {
    clearInterval(tickRef.current)
    endSession()
  }, [endSession])

  const handleResume = useCallback(() => {
    setShowBreak(false)
    setWarningDismissed(false)
    setSessionMinutes(0)
    startTime.current = Date.now()
    startSession()
    tickRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 60000)
      setSessionMinutes(elapsed)
      tickSession()
      if (elapsed >= WARNING_AT_MINUTES && !warningDismissed) {
        setShowWarning(true)
      }
      if (elapsed >= SESSION_LIMIT_MINUTES) {
        setShowBreak(true)
        setShowWarning(false)
        clearInterval(tickRef.current)
      }
    }, 60000)
  }, [startSession, tickSession, warningDismissed])

  useEffect(() => {
    return () => clearInterval(tickRef.current)
  }, [])

  return {
    startGuardian,
    stopGuardian,
    handleResume,
    showBreak,
    showWarning,
    sessionMinutes,
    dismissWarning: () => setWarningDismissed(true),
  }
}

// ── SessionGuardian Component ────────────────────────────────────
// Wrap the app content — renders break/warning overlays automatically
export default function SessionGuardian({ children }) {
  const {
    startGuardian, stopGuardian, handleResume,
    showBreak, showWarning, sessionMinutes, dismissWarning,
  } = useSessionGuardian()

  useEffect(() => {
    startGuardian()
    return () => stopGuardian()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {children}

      {/* 17-minute warning nudge */}
      <AnimatePresence>
        {showWarning && !showBreak && (
          <SessionWarning
            minutesLeft={SESSION_LIMIT_MINUTES - sessionMinutes}
            onDismiss={dismissWarning}
          />
        )}
      </AnimatePresence>

      {/* 20-minute break screen — covers everything */}
      <AnimatePresence>
        {showBreak && (
          <BreakScreen
            minutesPlayed={sessionMinutes}
            onResume={handleResume}
          />
        )}
      </AnimatePresence>
    </>
  )
}
