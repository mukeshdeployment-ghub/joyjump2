import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useJoyStore } from '../../lib/store'
import { signOut } from '../../lib/auth'
import { play } from '../../lib/sounds'

// Import the full dashboard content from the existing dashboard
import DashboardContent from '../dashboard/index'

export default function ParentDashboard() {
  const router = useRouter()
  const { parentSession, parentEmail, child, setParentSession } = useJoyStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  // Not yet hydrated — show nothing (avoids flash)
  if (!hydrated) return null

  // Not authenticated — redirect to login
  if (!parentSession) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1565C0 0%, #E3F2FD 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white', borderRadius: 32,
            padding: '40px 32px', maxWidth: 360, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 8 }}>🔐</div>
          <h2 style={{
            fontFamily: 'Fredoka, sans-serif', fontSize: 26,
            color: '#1565C0', margin: '0 0 8px',
          }}>
            Parent area
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontSize: 15,
            color: '#777', margin: '0 0 24px', lineHeight: 1.5,
          }}>
            Sign in to see {child.name}'s full learning report,
            weak topics, and session history.
          </p>
          <Link href="/parent/login">
            <button
              onClick={() => play('tap')}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #1E88E5, #1565C0)',
                color: 'white', border: 'none', borderRadius: 16,
                fontFamily: 'Baloo 2, sans-serif', fontWeight: 700,
                fontSize: 17, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(30,136,229,0.3)',
              }}
            >
              Sign in with Magic Link ✨
            </button>
          </Link>
          <Link href="/dashboard">
            <button
              onClick={() => play('tap')}
              style={{
                width: '100%', padding: '12px',
                background: 'none', border: '2px solid #E0E0E0',
                borderRadius: 16, marginTop: 10,
                fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                fontSize: 15, color: '#888', cursor: 'pointer',
              }}
            >
              View demo dashboard (no login)
            </button>
          </Link>
        </motion.div>
      </div>
    )
  }

  // Authenticated — render the full dashboard with signed-in header
  return (
    <div>
      {/* Auth status bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🔐</span>
          <div>
            <p style={{
              fontFamily: 'Fredoka, sans-serif', color: 'white',
              fontSize: 15, margin: 0, lineHeight: 1,
            }}>
              Signed in as parent
            </p>
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 12, margin: 0, fontWeight: 600,
            }}>
              {parentEmail}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            play('tap')
            await signOut()
            setParentSession(null)
            router.push('/')
          }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: 12, padding: '6px 14px',
            color: 'white', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700, fontSize: 13,
            backdropFilter: 'blur(8px)',
          }}
        >
          Sign Out
        </motion.button>
      </div>

      {/* Full dashboard content */}
      <DashboardContent />
    </div>
  )
}
