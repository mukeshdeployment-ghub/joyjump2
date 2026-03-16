import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import '../styles/globals.css'
import Onboarding from '../components/Onboarding'
import { MuteButton } from '../hooks/useSound'
import { useJoyStore } from '../lib/store'

const ONBOARDING_KEY = 'joyjump-onboarded'

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page)
  const { addStars, updateStreak } = useJoyStore()

  // We use a local hydrated flag to prevent rendering before
  // Zustand's localStorage rehydration completes (avoids flash of default state)
  const [hydrated, setHydrated] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // By the time this effect runs, Zustand has rehydrated from localStorage
    const done = localStorage.getItem(ONBOARDING_KEY) === 'true'
    setShowOnboarding(!done)

    // Update daily streak on every app open
    updateStreak()

    setHydrated(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnboardingComplete = () => {
    addStars(5)
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  // Pre-hydration: render a minimal loading screen that matches the app's sky gradient
  // This prevents a flash of unstyled content or wrong state
  if (!hydrated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #87CEEB 0%, #B8DEF5 50%, #E8F5E9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{ fontSize: 72, animation: 'floatSpin 1.5s ease-in-out infinite' }}>🌈</div>
        <p style={{ fontFamily: 'Nunito, sans-serif', color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: 700 }}>
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
    <>
      {/* Main app content */}
      {getLayout(<Component {...pageProps} />)}

      {/* Onboarding — shown on first ever visit, gates everything else */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Mute button — persistent, always accessible, above bottom nav */}
      {!showOnboarding && (
        <div style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 50 }}>
          <MuteButton />
        </div>
      )}
    </>
  )
}
