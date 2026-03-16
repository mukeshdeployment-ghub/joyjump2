import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { getSession } from '../../lib/auth'
import { syncChildProfile } from '../../lib/auth'
import { useJoyStore } from '../../lib/store'

const STATUS = {
  verifying: 'verifying',
  syncing:   'syncing',
  success:   'success',
  error:     'error',
}

export default function Verify() {
  const router = useRouter()
  const { childId, child, setParentSession } = useJoyStore()
  const [status, setStatus] = useState(STATUS.verifying)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Supabase's detectSessionFromUrl handles the token exchange automatically.
    // We just need to wait a tick for it to complete, then read the session.
    const run = async () => {
      try {
        // Short delay — let Supabase finish the PKCE exchange from URL hash
        await new Promise(r => setTimeout(r, 800))

        const session = await getSession()

        if (!session?.user) {
          setStatus(STATUS.error)
          setErrorMsg('The magic link has expired or is invalid. Please request a new one.')
          return
        }

        // Store session in Zustand
        setParentSession(session)
        setStatus(STATUS.syncing)

        // Link the browser's localStorage childId to this parent's account
        await syncChildProfile({
          parentAuthId: session.user.id,
          childId,
          childName:    child.name,
          avatar:       child.avatar,
          grade:        child.grade || 3,
        })

        setStatus(STATUS.success)

        // Redirect to parent dashboard after brief success flash
        setTimeout(() => router.replace('/parent/dashboard'), 1200)

      } catch (err) {
        console.error('[Verify] Error:', err)
        setStatus(STATUS.error)
        setErrorMsg(err.message || 'Something went wrong. Please try logging in again.')
      }
    }

    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const messages = {
    [STATUS.verifying]: { icon: '🔐', title: 'Verifying your link...', sub: 'Just a moment!', color: '#1E88E5' },
    [STATUS.syncing]:   { icon: '🔄', title: 'Syncing your profile...', sub: 'Almost there!', color: '#43A047' },
    [STATUS.success]:   { icon: '✅', title: 'Logged in!', sub: 'Taking you to the dashboard...', color: '#43A047' },
    [STATUS.error]:     { icon: '⚠️', title: 'Link expired', sub: errorMsg, color: '#E53935' },
  }

  const { icon, title, sub, color } = messages[status]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1565C0 0%, #1976D2 40%, #E3F2FD 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 14 }}
        style={{
          background: 'white', borderRadius: 32,
          padding: '48px 36px', maxWidth: 380, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        <motion.div
          key={status}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          style={{ fontSize: 72, marginBottom: 12 }}
        >
          {icon}
        </motion.div>

        <h2 style={{
          fontFamily: 'Fredoka, sans-serif', fontSize: 28,
          color, margin: '0 0 8px',
        }}>
          {title}
        </h2>

        <p style={{
          fontFamily: 'Nunito, sans-serif', fontSize: 15,
          color: '#777', lineHeight: 1.5, margin: '0 0 24px',
        }}>
          {sub}
        </p>

        {/* Animated progress dots for verifying/syncing */}
        {(status === STATUS.verifying || status === STATUS.syncing) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: color,
                }}
              />
            ))}
          </div>
        )}

        {/* Error — try again button */}
        {status === STATUS.error && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => router.replace('/parent/login')}
            style={{
              background: 'linear-gradient(135deg, #1E88E5, #1565C0)',
              color: 'white', border: 'none', borderRadius: 16,
              padding: '13px 32px', fontSize: 16,
              fontFamily: 'Baloo 2, sans-serif', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(30,136,229,0.35)',
            }}
          >
            Try logging in again
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
