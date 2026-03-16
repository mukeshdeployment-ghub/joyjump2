import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useJoyStore = create(
  persist(
    (set, get) => ({
      child: { name: 'Dhruvee', avatar: 'panda', grade: 3 },
      setChild: (child) => set({ child }),

      stars: 0, coins: 0, badges: [], streak: 0, lastPlayDate: null,
      unlockedWorlds: ['math'],

      addStars: (n) => set((s) => ({ stars: s.stars + n })),
      addCoins: (n) => set((s) => ({ coins: s.coins + n })),
      addBadge: (b) => set((s) => ({ badges: s.badges.includes(b) ? s.badges : [...s.badges, b] })),
      unlockWorld: (w) => set((s) => ({ unlockedWorlds: s.unlockedWorlds.includes(w) ? s.unlockedWorlds : [...s.unlockedWorlds, w] })),

      updateStreak: () => {
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        const last = get().lastPlayDate
        if (last === today) return
        set((s) => ({ streak: last === yesterday ? s.streak + 1 : 1, lastPlayDate: today }))
      },

      progress: {},
      markComplete: (lessonId, score) => set((s) => ({
        progress: {
          ...s.progress,
          [lessonId]: { completed: true, score, attempts: (s.progress[lessonId]?.attempts || 0) + 1, at: new Date().toISOString() }
        }
      })),
      getProgress: (lessonId) => get().progress[lessonId] || null,

      showCelebration: false,
      celebrationData: null,
      triggerCelebration: (data) => {
        set({ showCelebration: true, celebrationData: data })
        setTimeout(() => set({ showCelebration: false, celebrationData: null }), 4000)
      },
    }),
    {
      name: 'joyjump-v2',
      partialize: (s) => ({
        child: s.child, stars: s.stars, coins: s.coins,
        badges: s.badges, streak: s.streak, lastPlayDate: s.lastPlayDate,
        unlockedWorlds: s.unlockedWorlds, progress: s.progress,
      }),
    }
  )
)
