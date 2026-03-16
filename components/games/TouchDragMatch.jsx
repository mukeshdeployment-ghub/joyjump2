import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterSays } from '../characters/Character'
import { play } from '../../lib/sounds'

/**
 * TouchDragMatch — A touch-native drag & drop matching game.
 * Uses pointer events (not HTML5 drag API) so it works perfectly on tablets.
 */
export default function TouchDragMatch({ game, character = 'max', onComplete }) {
  const [items, setItems] = useState(() =>
    game.pairs.map((p, i) => ({ ...p, id: i, placed: false }))
  )
  const [slots, setSlots] = useState(() =>
    // Shuffle the match targets
    game.pairs.map((p, i) => ({ ...p, id: i, filled: null }))
      .sort(() => Math.random() - 0.5)
  )
  const [dragging, setDragging] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [results, setResults] = useState(null)
  const [checked, setChecked] = useState(false)
  const containerRef = useRef(null)
  const dragRef = useRef(null)

  const allPlaced = items.every(i => i.placed)

  // ── Pointer event handlers ──────────────────────────────────────
  const handlePointerDown = useCallback((e, item) => {
    if (item.placed || checked) return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch(_) {}
    play('dragStart')

    const rect = e.currentTarget.getBoundingClientRect()
    setDragging({ ...item, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top })
    setDragPos({ x: e.clientX - (e.clientX - rect.left), y: e.clientY - (e.clientY - rect.top) })
  }, [checked])

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return
    e.preventDefault()
    setDragPos({ x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY })
  }, [dragging])

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return
    try { e.currentTarget.releasePointerCapture?.(e.pointerId) } catch(_) {}

    // Find which slot we're over
    const allSlots = document.querySelectorAll('[data-slot]')
    let dropped = false

    allSlots.forEach(slotEl => {
      const rect = slotEl.getBoundingClientRect()
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        const slotId = parseInt(slotEl.dataset.slot)
        const slot = slots.find(s => s.id === slotId)
        if (slot && slot.filled === null) {
          // Drop into this slot
          play('snap')
          setSlots(prev => prev.map(s =>
            s.id === slotId ? { ...s, filled: dragging } : s
          ))
          setItems(prev => prev.map(it =>
            it.id === dragging.id ? { ...it, placed: true } : it
          ))
          dropped = true
        }
      }
    })

    if (!dropped) {
      // Snap back
    }

    setDragging(null)
  }, [dragging, slots])

  // Remove from slot on tap
  const handleSlotTap = useCallback((slot) => {
    if (checked || !slot.filled) return
    play('tap')
    setItems(prev => prev.map(it =>
      it.id === slot.filled.id ? { ...it, placed: false } : it
    ))
    setSlots(prev => prev.map(s =>
      s.id === slot.id ? { ...s, filled: null } : s
    ))
  }, [checked])

  const handleCheck = useCallback(() => {
    const newResults = {}
    slots.forEach(slot => {
      if (slot.filled) {
        newResults[slot.filled.id] = slot.filled.id === slot.id
      }
    })
    setResults(newResults)
    setChecked(true)
    const allCorrect = Object.values(newResults).every(Boolean)
    if (allCorrect) { play('celebrate') } else { play('wrong') }
  }, [slots])

  const handleReset = useCallback(() => {
    setItems(game.pairs.map((p, i) => ({ ...p, id: i, placed: false })))
    setSlots(game.pairs.map((p, i) => ({ ...p, id: i, filled: null })).sort(() => Math.random() - 0.5))
    setResults(null)
    setChecked(false)
  }, [game])

  const correctCount = results ? Object.values(results).filter(Boolean).length : 0
  const allCorrect = results && Object.values(results).every(Boolean)
  const score = checked ? Math.round((correctCount / game.pairs.length) * 3) : 0

  const itemColors = [
    { bg: '#FFF3E0', border: '#FFCC80', text: '#E65100' },
    { bg: '#E8F5E9', border: '#A5D6A7', text: '#1B5E20' },
    { bg: '#E3F2FD', border: '#90CAF9', text: '#0D47A1' },
    { bg: '#EDE7F6', border: '#CE93D8', text: '#4A148C' },
    { bg: '#FCE4EC', border: '#F48FB1', text: '#880E4F' },
    { bg: '#FFF9C4', border: '#FFF176', text: '#F57F17' },
  ]

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-5 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <CharacterSays
        char={character}
        mood={!checked ? 'intro' : allCorrect ? 'celebrate' : 'wrong'}
      />

      <div className="bg-white rounded-3xl shadow-joy p-5">
        <p className="font-fredoka text-xl text-center text-gray-700 mb-5">{game.question}</p>

        {/* Items to drag (source) */}
        <div className="mb-5">
          <p className="font-baloo text-xs font-bold text-gray-400 text-center mb-2">
            Drag these ↓
          </p>
          <div className="flex flex-wrap gap-2 justify-center p-3 bg-gray-50 rounded-2xl min-h-[60px]">
            {items.map((item, idx) => {
              const col = itemColors[item.id % itemColors.length]
              if (item.placed) return (
                <div key={item.id} className="w-20 h-12 rounded-xl border-2 border-dashed border-gray-200 opacity-30" />
              )
              return (
                <motion.div
                  key={item.id}
                  className="drag-item cursor-grab active:cursor-grabbing touch-none"
                  style={{ background: col.bg, border: `2px solid ${col.border}`, color: col.text }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                >
                  {item.item}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Drop slots (targets) */}
        <div className="grid grid-cols-2 gap-3">
          {slots.map((slot) => {
            const isCorrect = results && slot.filled ? results[slot.filled.id] : null
            const col = slot.filled ? itemColors[slot.filled.id % itemColors.length] : null

            return (
              <div
                key={slot.id}
                data-slot={slot.id}
                className={`drop-zone flex-col gap-1 p-3 text-center min-h-[70px] rounded-2xl transition-all
                  ${!slot.filled ? 'border-dashed' : ''}
                  ${checked && isCorrect === true ? 'correct-drop' : ''}
                  ${checked && isCorrect === false ? 'wrong-drop' : ''}
                `}
                onClick={() => handleSlotTap(slot)}
              >
                <p className="font-nunito text-xs font-bold text-gray-400">{slot.match}</p>
                {slot.filled && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="font-baloo font-bold text-sm"
                    style={col ? { color: col.text } : {}}
                  >
                    {slot.filled.item}
                    {checked && (isCorrect ? ' ✅' : ' ❌')}
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>

        {/* Hint */}
        {game.hint && !checked && (
          <div className="mt-3 bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 flex gap-2">
            <span>💡</span>
            <p className="font-nunito text-sm font-semibold text-amber-800">{game.hint}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {!checked ? (
        <div className="flex gap-3">
          <button onClick={handleReset}
            className="joy-btn flex-1 text-base py-4"
            style={{ background: 'linear-gradient(135deg, #9E9E9E, #757575)' }}>
            Reset 🔄
          </button>
          <button
            onClick={handleCheck} disabled={!allPlaced}
            className={`joy-btn joy-btn-green flex-1 text-base py-4 ${!allPlaced ? 'opacity-40' : ''}`}
          >
            Check! ✅
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="font-fredoka text-2xl mb-3">
            {allCorrect ? '🎉 Perfect match!' : `⭐ ${correctCount}/${game.pairs.length} correct!`}
          </p>
          <div className="flex gap-3">
            {!allCorrect && (
              <button onClick={handleReset}
                className="joy-btn flex-1 text-base py-4"
                style={{ background: 'linear-gradient(135deg, #FFB74D, #FF8F00)' }}>
                Try Again 🔄
              </button>
            )}
            <button onClick={() => { play('tap'); onComplete({ score, correct: allCorrect }) }}
              className="joy-btn joy-btn-orange flex-1 text-base py-4">
              Continue →
            </button>
          </div>
        </motion.div>
      )}

      {/* Floating drag ghost */}
      {dragging && (
        <div
          className="fixed pointer-events-none z-[500] drag-item dragging"
          style={{
            left: dragPos.x, top: dragPos.y,
            background: itemColors[dragging.id % itemColors.length].bg,
            border: `3px solid ${itemColors[dragging.id % itemColors.length].border}`,
            color: itemColors[dragging.id % itemColors.length].text,
            transform: 'rotate(3deg) scale(1.1)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
          }}
        >
          {dragging.item}
        </div>
      )}
    </div>
  )
}
