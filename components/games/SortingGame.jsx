import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterSays } from '../characters/Character'
import { play } from '../../lib/sounds'

export default function SortingGame({ game, character = 'max', onComplete }) {
  const [sorted, setSorted] = useState(() => game.categories.map(() => []))
  const [remaining, setRemaining] = useState(game.items)
  const [dragging, setDragging] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [activeZone, setActiveZone] = useState(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState(null)

  const catColors = [
    { bg: '#E3F2FD', border: '#90CAF9', text: '#0D47A1', pill: '#1E88E5', active: '#BBDEFB' },
    { bg: '#E8F5E9', border: '#A5D6A7', text: '#1B5E20', pill: '#43A047', active: '#C8E6C9' },
    { bg: '#EDE7F6', border: '#CE93D8', text: '#4A148C', pill: '#7B1FA2', active: '#D1C4E9' },
    { bg: '#FFF3E0', border: '#FFCC80', text: '#E65100', pill: '#FB8C00', active: '#FFE0B2' },
  ]

  const handlePointerDown = useCallback((e, item) => {
    if (checked) return
    e.preventDefault()
    e.stopPropagation()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_) {}
    play('dragStart')
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    setDragging({ item, offsetX, offsetY })
    setDragPos({ x: e.clientX - offsetX, y: e.clientY - offsetY })
  }, [checked])

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return
    e.preventDefault()
    setDragPos({ x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY })
    const zones = document.querySelectorAll('[data-zone]')
    let found = null
    zones.forEach(el => {
      const r = el.getBoundingClientRect()
      if (e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top  && e.clientY <= r.bottom) {
        found = parseInt(el.dataset.zone, 10)
      }
    })
    setActiveZone(found)
  }, [dragging])

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return
    try { e.currentTarget.releasePointerCapture?.(e.pointerId) } catch (_) {}
    if (activeZone !== null) {
      play('snap')
      setSorted(prev => {
        const next = prev.map(c => [...c])
        next[activeZone] = [...next[activeZone], dragging.item]
        return next
      })
      setRemaining(prev => prev.filter(i => i.name !== dragging.item.name))
    }
    setDragging(null)
    setActiveZone(null)
  }, [dragging, activeZone])

  const handleRemove = useCallback((catIdx, itemName) => {
    if (checked) return
    play('tap')
    const item = sorted[catIdx].find(i => i.name === itemName)
    setSorted(prev => {
      const next = prev.map(c => [...c])
      next[catIdx] = next[catIdx].filter(i => i.name !== itemName)
      return next
    })
    setRemaining(prev => [...prev, item])
  }, [sorted, checked])

  const handleCheck = useCallback(() => {
    const r = {}
    game.items.forEach(item => {
      const placed = sorted.findIndex(cat => cat.some(i => i.name === item.name))
      r[item.name] = placed === item.category
    })
    setResults(r)
    setChecked(true)
    Object.values(r).every(Boolean) ? play('celebrate') : play('wrong')
  }, [sorted, game.items])

  const handleReset = () => {
    setSorted(game.categories.map(() => []))
    setRemaining(game.items)
    setChecked(false)
    setResults(null)
    setDragging(null)
    setActiveZone(null)
  }

  const allPlaced = remaining.length === 0
  const allCorrect = results && Object.values(results).every(Boolean)
  const correctCount = results ? Object.values(results).filter(Boolean).length : 0
  const score = checked ? Math.round((correctCount / game.items.length) * 3) : 0

  return (
    <div
      className="flex flex-col gap-5 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      <CharacterSays char={character} mood={!checked ? 'intro' : allCorrect ? 'celebrate' : 'wrong'} />

      <div className="bg-white rounded-3xl shadow-joy p-5">
        <p className="font-fredoka text-xl text-center text-gray-700 mb-4">{game.question}</p>

        {remaining.length > 0 && (
          <div className="mb-4">
            <p className="font-baloo text-xs font-bold text-gray-400 text-center mb-2">Drag into the right group ↓</p>
            <div className="flex flex-wrap gap-2 justify-center p-3 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[64px]">
              {remaining.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: dragging?.item.name === item.name ? 0.85 : 1,
                    opacity: dragging?.item.name === item.name ? 0.3 : 1,
                  }}
                  transition={{ delay: i * 0.05 }}
                  onPointerDown={e => handlePointerDown(e, item)}
                  className="drag-item touch-none"
                  style={{
                    background: 'linear-gradient(135deg, #EDE7F6, #D1C4E9)',
                    border: '2px solid #CE93D8',
                    color: '#4A148C',
                    cursor: dragging ? 'grabbing' : 'grab',
                  }}
                >
                  {item.name}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className={`grid gap-3 ${game.categories.length <= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {game.categories.map((cat, catIdx) => {
            const col = catColors[catIdx % catColors.length]
            const isActive = activeZone === catIdx
            return (
              <motion.div
                key={catIdx}
                data-zone={catIdx}
                animate={{ scale: isActive ? 1.03 : 1 }}
                transition={{ duration: 0.12 }}
                className="rounded-2xl p-3 min-h-[90px] border-2 transition-colors"
                style={{
                  background: isActive ? col.active : col.bg,
                  borderColor: isActive ? col.pill : `${col.border}80`,
                  borderStyle: 'dashed',
                  boxShadow: isActive ? `0 0 0 3px ${col.pill}40` : 'none',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-lg text-white text-xs font-bold font-baloo"
                    style={{ background: col.pill }}>{cat}</span>
                  {isActive && dragging && (
                    <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-xs font-nunito font-bold" style={{ color: col.pill }}>
                      Drop here!
                    </motion.span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sorted[catIdx].map(item => {
                    const ok = results?.[item.name]
                    return (
                      <motion.button key={item.name}
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        onClick={() => handleRemove(catIdx, item.name)}
                        disabled={checked}
                        className="px-3 py-1.5 rounded-xl text-sm font-bold font-baloo transition-all"
                        style={{
                          background: checked ? (ok ? '#43A047' : '#E53935') : 'white',
                          color: checked ? 'white' : col.text,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        {item.name}{checked && <span className="ml-1">{ok ? '✅' : '❌'}</span>}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {game.hint && !checked && (
          <div className="mt-3 bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 flex gap-2 items-start">
            <span className="text-xl flex-shrink-0">💡</span>
            <p className="font-nunito text-sm font-semibold text-amber-800">{game.hint}</p>
          </div>
        )}
      </div>

      {!checked ? (
        <div className="flex gap-3">
          <button onClick={handleReset} className="joy-btn flex-1 text-base py-4"
            style={{ background: 'linear-gradient(135deg, #9E9E9E, #757575)' }}>Reset 🔄</button>
          <button onClick={handleCheck} disabled={!allPlaced}
            className={`joy-btn joy-btn-green flex-1 text-base py-4 ${!allPlaced ? 'opacity-40' : ''}`}>
            Check! ✅</button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 text-center ${allCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
          <p className="font-fredoka text-2xl mb-3">
            {allCorrect ? '🎉 Perfect sorting!' : `⭐ ${correctCount} / ${game.items.length} correct!`}
          </p>
          <div className="flex gap-3">
            {!allCorrect && (
              <button onClick={handleReset} className="joy-btn flex-1 text-base py-4"
                style={{ background: 'linear-gradient(135deg, #FFB74D, #FF8F00)' }}>Try Again 🔄</button>
            )}
            <button onClick={() => { play('tap'); onComplete({ score, correct: allCorrect }) }}
              className="joy-btn joy-btn-orange flex-1 text-base py-4">Continue →</button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.1, rotate: 3 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed pointer-events-none z-[500] drag-item dragging font-baloo font-bold"
            style={{
              left: dragPos.x,
              top: dragPos.y,
              background: 'linear-gradient(135deg, #EDE7F6, #D1C4E9)',
              border: '3px solid #7B1FA2',
              color: '#4A148C',
              boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
              touchAction: 'none',
            }}
          >
            {dragging.item.name}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
