import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { signInWithMagicLink } from '../../lib/auth'
import { useJoyStore } from '../../lib/store'
import { play } from '../../lib/sounds'
import Link from 'next/link'

const STEPS = { idle: 'idle', sending: 'sending', sent: 'sent', error: 'error' }

export default function ParentLogin() {
  const router = useRouter()
  const { parentSession, child } = useJoyStore()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState(STEPS.idle)
  const [errorMsg, setErrorMsg] = useState('')

  // Already signed in — go straight to dashboard
  if (parentSession) {
    if (typeof window !== 'undefined') router.replace('/parent/dashboard')
    return null
  }

  const handleSubmit = async () => {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      setStep(STEPS.error)
      return
    }

    setStep(STEPS.sending)
    setErrorMsg('')

    try {
      await signInWithMagicLink(trimmed)
      play('celebrate')
      setStep(STEPS.sent)
    } catch (err) {
      setStep(STEPS.error)
      setErrorMsg(err.message || 'Could not send login link. Please try again.')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1565C0 0%, #1976D2 40%, #E3F2FD 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Back to app */}
      <Link href="/">
        <motion.button
          whileHover={{ x: -3 }}
          style={{
            position: 'absolute', top: 20, left: 20,
            background: 'rgba(255,255,255,0.2)',
            border: 'none', borderRadius: 12,
            color: 'white', padding: '8px 16px',
            fontFamily: 'Nunito, sans-serif', fontWeight: 700,
            fontSize: 14, cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          ← Back to {child.name}'s App
        </motion.button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 16 }}
        style={{
          background: 'white', borderRadius: 32,
          padding: '44px 36px', maxWidth: 400, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 6,
          borderRadius: '32px 32px 0 0',
          background: 'linear-gradient(90deg, #1E88E5, #43A047, #FB8C00, #E91E63)',
        }} />

        <AnimatePresence mode="wait">

          {/* IDLE / ERROR — email input */}
          {(step === STEPS.idle || step === STEPS.error || step === STEPS.sending) && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ fontSize: 64, marginBottom: 8 }}
              >
                👩‍👧
              </motion.div>

              <h1 style={{
                fontFamily: 'Fredoka, sans-serif', fontSize: 30,
                color: '#1565C0', margin: '0 0 6px',
              }}>
                Parent Dashboard
              </h1>

              <p style={{
                fontFamily: 'Nunito, sans-serif', fontSize: 15,
                color: '#777', margin: '0 0 28px', lineHeight: 1.5,
              }}>
                Enter your email and we'll send you a magic link —
                no password needed!
              </p>

              {/* Email input */}
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setStep(STEPS.idle) }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="your@email.com"
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '14px 18px', fontSize: 16,
                  fontFamily: 'Nunito, sans-serif', fontWeight: 600,
                  border: step === STEPS.error ? '2.5px solid #E53935' : '2.5px solid #BBDEFB',
                  borderRadius: 16, outline: 'none',
                  background: '#F8FBFF', color: '#1A1A2E',
                  marginBottom: step === STEPS.error ? 8 : 20,
                  transition: 'border-color 0.2s',
                }}
              />

              {/* Error message */}
              <AnimatePresence>
                {step === STEPS.error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      fontFamily: 'Nunito, sans-serif', fontSize: 13,
                      color: '#E53935', marginBottom: 16, fontWeight: 600,
                    }}
                  >
                    ⚠️ {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Send button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={step === STEPS.sending}
                style={{
                  width: '100%', padding: '15px',
                  background: step === STEPS.sending
                    ? 'linear-gradient(135deg, #90CAF9, #64B5F6)'
                    : 'linear-gradient(135deg, #1E88E5, #1565C0)',
                  color: 'white', border: 'none', borderRadius: 18,
                  fontFamily: 'Baloo 2, sans-serif', fontWeight: 700,
                  fontSize: 18, cursor: step === STEPS.sending ? 'wait' : 'pointer',
                  boxShadow: '0 6px 20px rgba(30,136,229,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {step === STEPS.sending
                  ? '✉️ Sending magic link...'
                  : '✨ Send Magic Link'}
              </motion.button>

              {/* Privacy note */}
              <p style={{
                fontFamily: 'Nunito, sans-serif', fontSize: 12,
                color: '#bbb', marginTop: 16, lineHeight: 1.4,
              }}>
                🔒 We only use your email to send the login link.
                No passwords, no spam.
              </p>
            </motion.div>
          )}

          {/* SENT — check email */}
          {step === STEPS.sent && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 0.7, delay: 0.3 }}
                style={{ fontSize: 72, marginBottom: 8 }}
              >
                📬
              </motion.div>

              <h2 style={{
                fontFamily: 'Fredoka, sans-serif', fontSize: 28,
                color: '#43A047', margin: '0 0 8px',
              }}>
                Check your email!
              </h2>

              <p style={{
                fontFamily: 'Nunito, sans-serif', fontSize: 15,
                color: '#555', lineHeight: 1.6, margin: '0 0 20px',
              }}>
                We sent a magic link to<br />
                <strong style={{ color: '#1565C0' }}>{email}</strong>
              </p>

              <div style={{
                background: '#E8F5E9', borderRadius: 16,
                padding: '14px 18px', marginBottom: 24,
                fontFamily: 'Nunito, sans-serif', fontSize: 14,
                color: '#2E7D32', lineHeight: 1.5,
              }}>
                <strong>What to do:</strong><br />
                1. Open the email on this device<br />
                2. Click the "Sign in to JoyJump" link<br />
                3. You'll be taken straight to the dashboard
              </div>

              <p style={{
                fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#aaa',
              }}>
                Link expires in 1 hour · Didn't receive it?{' '}
                <span
                  onClick={() => { setStep(STEPS.idle); setEmail('') }}
                  style={{
                    color: '#1E88E5', cursor: 'pointer',
                    textDecoration: 'underline', fontWeight: 600,
                  }}
                >
                  Try again
                </span>
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* App watermark */}
      <p style={{
        fontFamily: 'Fredoka, sans-serif', color: 'rgba(255,255,255,0.5)',
        fontSize: 16, marginTop: 24, textAlign: 'center',
      }}>
        🌈 JoyJump · {child.name}'s learning universe
      </p>
    </div>
  )
}
