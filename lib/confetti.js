export async function fireConfetti(type = 'standard') {
  if (typeof window === 'undefined') return
  const confetti = (await import('canvas-confetti')).default

  const joyColors = ['#F4A261', '#FFD700', '#74C0FC', '#52B788', '#FF8FAB', '#B197FC', '#FF9F9F']

  if (type === 'stars') {
    confetti({ particleCount: 40, spread: 80, origin: { y: 0.65 },
      shapes: ['star'], colors: ['#FFD700', '#FFE066', '#FF70A6', '#FF8FAB'],
      scalar: 1.4, gravity: 0.8 })
    return
  }

  if (type === 'mega') {
    // 3-wave confetti explosion
    const launch = (delay) => setTimeout(() => {
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 },
        colors: joyColors, scalar: 1.2, gravity: 0.9 })
      confetti({ particleCount: 40, angle: 60, spread: 60, origin: { x: 0, y: 0.6 },
        colors: joyColors, scalar: 1.0 })
      confetti({ particleCount: 40, angle: 120, spread: 60, origin: { x: 1, y: 0.6 },
        colors: joyColors, scalar: 1.0 })
    }, delay)
    launch(0); launch(350); launch(700)
    return
  }

  if (type === 'side') {
    const end = Date.now() + 2000
    const colors = joyColors
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors, scalar: 0.9 })
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors, scalar: 0.9 })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
    return
  }

  // Standard
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.65 }, colors: joyColors, scalar: 1.1 })
}
