import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import '../styles/globals.css'
import Onboarding from '../components/Onboarding'
import { MuteButton } from '../hooks/useSound'
import { useJoyStore } from '../lib/store'
import ErrorBoundary from '../components/ErrorBoundary'
import SessionGuardian from '../components/layout/SessionGuardian'
import { onAuthChange, getSession } from '../lib/auth'

const ONBOARDING_KEY = 'joyjump-onboarded-v4'   // versioned key

// World unlock thresholds — must match WorldMap.jsx WORLDS array
const UNLOCK_THRESHOLDS = [
  { id: 'story',      requiredStars: 20 },
  { id: 'hindi',      requiredStars: 30 },
  { id: 'science',    requiredStars: 40 },
  { id: 'discovery',  requiredStars: 60 },
  { id: 'creativity', requiredStars: 80 },
]

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page)
  const { addStars, updateStreak, stars, unlockedWorlds, unlockWorld, setParentSession } = useJoyStore()

  const [hydrated, setHydrated] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [newUnlock, setNewUnlock] = useState(null)

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY) === 'true'
    setShowOnboarding(!done)
    updateStreak()

    // Phase 1b: restore auth session on reload and subscribe to changes
    getSession().then(session => {
      if (session) setParentSession(session)
    })
    const unsubAuth = onAuthChange(session => {
      setParentSession(session || null)
    })

    setHydrated(true)
    return () => unsubAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-unlock worlds when star thresholds are crossed
  useEffect(() => {
    if (!hydrated) return
    UNLOCK_THRESHOLDS.forEach(({ id, requiredStars }) => {
      if (stars >= requiredStars && !unlockedWorlds.includes(id)) {
        unlockWorld(id)
        setNewUnlock(id)
        setTimeout(() => setNewUnlock(null), 4000)
      }
    })
  }, [stars, hydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnboardingComplete = () => {
    addStars(5)
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  // Pre-hydration loading screen
  if (!hydrated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #87CEEB 0%, #B8DEF5 50%, #E8F5E9 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 72, animation: 'floatSpin 1.5s ease-in-out infinite' }}>🌈</div>
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: 700,
        }}>
          Loading your universe...
        </p>
        <style>{`
          @keyframes floatSpin {
            0%   { transform: translateY(0) rotate(0deg); }
            50%  { transform: translateY(-12px) rotate(10deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      {/* SessionGuardian wraps all content — enforces 20-min session limit */}
      <SessionGuardian>
        <>
          {getLayout(<Component {...pageProps} />)}

          {/* Onboarding — first visit only */}
          <AnimatePresence>
            {showOnboarding && (
              <Onboarding onComplete={handleOnboardingComplete} />
            )}
          </AnimatePresence>

          {/* World unlock banner */}
          <AnimatePresence>
            {newUnlock && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: 'spring', damping: 12 }}
                style={{
                  position: 'fixed', top: 16, left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 999,
                  background: 'linear-gradient(135deg, #FFD700, #FF8F00)',
                  color: '#5D3A00', borderRadius: 20,
                  padding: '14px 28px',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: 18, fontWeight: 600,
                  boxShadow: '0 8px 32px rgba(255,150,0,0.4)',
                  whiteSpace: 'nowrap',
                }}
              >
                🎉 New world unlocked! Go explore!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent mute button */}
          {!showOnboarding && (
            <div style={{
              position: 'fixed', bottom: 80, right: 16, zIndex: 50,
            }}>
              <MuteButton />
            </div>
          )}
        </>
      </SessionGuardian>
    </ErrorBoundary>
  )
}

// Next.js automatically calls this to collect Core Web Vitals
export { reportWebVitals } from '../lib/vitals'
