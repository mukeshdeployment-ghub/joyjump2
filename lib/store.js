import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── UUID generator (browser-native, no dependency) ───────────────
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const useJoyStore = create(
  persist(
    (set, get) => ({
      // ── Child profile ──────────────────────────────────────────
      // childId is a stable UUID generated once and persisted.
      // It is NEVER the child's name — names collide, UUIDs don't.
      childId: generateUUID(),   // will be overwritten by persisted value on reload
      child: { name: 'Dhruvee', avatar: 'panda', grade: 3 },
      setChild: (child) => set({ child }),
      // Regenerating childId should never happen after first creation,
      // but we expose it for parent "reset profile" in future.
      resetChildId: () => set({ childId: generateUUID() }),

      // ── Parent Auth session (Phase 1b) ────────────────────────
      // Holds the Supabase auth session for the parent.
      // null = not logged in (demo mode — everything still works).
      // Set by _app.js via onAuthStateChange.
      parentSession: null,
      parentEmail:   null,
      setParentSession: (session) => set({
        parentSession: session,
        parentEmail:   session?.user?.email || null,
      }),

      // ── Rewards ────────────────────────────────────────────────
      stars: 0,
      coins: 0,
      badges: [],
      unlockedWorlds: ['math'],

      addStars:    (n) => set((s) => ({ stars: s.stars + n })),
      addCoins:    (n) => set((s) => ({ coins: s.coins + n })),
      addBadge:    (b) => set((s) => ({ badges: s.badges.includes(b) ? s.badges : [...s.badges, b] })),
      unlockWorld: (w) => set((s) => ({
        unlockedWorlds: s.unlockedWorlds.includes(w)
          ? s.unlockedWorlds
          : [...s.unlockedWorlds, w],
      })),

      // ── Streak ─────────────────────────────────────────────────
      streak: 0,
      lastPlayDate: null,
      updateStreak: () => {
        const today     = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        const last      = get().lastPlayDate
        if (last === today) return
        set((s) => ({
          streak:       last === yesterday ? s.streak + 1 : 1,
          lastPlayDate: today,
        }))
      },

      // ── Progress ───────────────────────────────────────────────
      // Stores the BEST score per lesson (for display).
      // Full attempt history lives in Supabase — not in localStorage.
      progress: {},
      markComplete: (lessonId, score) =>
        set((s) => {
          const existing = s.progress[lessonId]
          return {
            progress: {
              ...s.progress,
              [lessonId]: {
                completed:  true,
                score:      Math.max(score, existing?.score || 0), // keep best
                attempts:   (existing?.attempts || 0) + 1,
                firstAt:    existing?.firstAt || new Date().toISOString(),
                lastAt:     new Date().toISOString(),
              },
            },
          }
        }),
      getProgress: (lessonId) => get().progress[lessonId] || null,

      // ── Session time tracking ──────────────────────────────────
      sessionStartedAt: null,
      totalMinutesToday: 0,
      lastSessionDate: null,
      startSession: () => {
        const today = new Date().toDateString()
        const last  = get().lastSessionDate
        set({
          sessionStartedAt:  Date.now(),
          totalMinutesToday: last === today ? get().totalMinutesToday : 0,
          lastSessionDate:   today,
        })
      },
      tickSession: () => {
        const start = get().sessionStartedAt
        if (!start) return
        const elapsed = Math.floor((Date.now() - start) / 60000) // minutes
        set({ totalMinutesToday: elapsed })
      },
      endSession: () => {
        const start = get().sessionStartedAt
        if (!start) return
        const elapsed = Math.floor((Date.now() - start) / 60000)
        set((s) => ({
          sessionStartedAt:  null,
          totalMinutesToday: s.totalMinutesToday + elapsed,
        }))
      },

      // ── UI ─────────────────────────────────────────────────────
      showCelebration:  false,
      celebrationData:  null,
      triggerCelebration: (data) => {
        set({ showCelebration: true, celebrationData: data })
        setTimeout(() => set({ showCelebration: false, celebrationData: null }), 4000)
      },
    }),
    {
      name: 'joyjump-v4',
      partialize: (s) => ({
        childId:           s.childId,
        child:             s.child,
        stars:             s.stars,
        coins:             s.coins,
        badges:            s.badges,
        streak:            s.streak,
        lastPlayDate:      s.lastPlayDate,
        unlockedWorlds:    s.unlockedWorlds,
        progress:          s.progress,
        totalMinutesToday: s.totalMinutesToday,
        lastSessionDate:   s.lastSessionDate,
        parentEmail:       s.parentEmail,   // persist email so dashboard shows it offline
      }),
    }
  )
)
