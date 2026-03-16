import { useCallback, useEffect, useState } from 'react'
import { play as rawPlay } from '../lib/sounds'

// Persists mute preference in localStorage
const MUTE_KEY = 'joyjump-muted'

let globalMuted = false
if (typeof window !== 'undefined') {
  globalMuted = localStorage.getItem(MUTE_KEY) === 'true'
}

export function useSound() {
  const [muted, setMuted] = useState(globalMuted)

  const play = useCallback((name) => {
    if (!muted) rawPlay(name)
  }, [muted])

  const toggleMute = useCallback(() => {
    const next = !muted
    setMuted(next)
    globalMuted = next
    if (typeof window !== 'undefined') {
      localStorage.setItem(MUTE_KEY, String(next))
    }
  }, [muted])

  return { play, muted, toggleMute }
}

// Mute button component - drop this anywhere in the UI
export function MuteButton() {
  const { muted, toggleMute } = useSound()
  return (
    <button
      onClick={toggleMute}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
      style={{
        background: 'rgba(255,255,255,0.85)',
        border: '2px solid rgba(0,0,0,0.08)',
        borderRadius: 12,
        padding: '6px 10px',
        fontSize: 20,
        cursor: 'pointer',
        lineHeight: 1,
        backdropFilter: 'blur(8px)',
      }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
