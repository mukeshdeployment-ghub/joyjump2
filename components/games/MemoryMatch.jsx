import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterSays } from '../characters/Character'
import { play } from '../../lib/sounds'

/**
 * Memory Match — Flip cards to find matching pairs.
 * Works with emoji pairs, word-image pairs, number pairs.
 * Fully touch-native, no drag needed.
 */
export default function MemoryMatch({ game, character = 'max', onComplete }) {
  // Build shuffled deck: each pair appears twice with unique cardId
  const [cards, setCards] = useState(() => {
    const deck = []
    game.pairs.forEach((pair, i) => {
      deck.push({ id: `a${i}`, pairId: i, content: pair.a, matched: false, flipped: false })
      deck.push({ id: `b${i}`, pairId: i, content: pair.b, matched: false, flipped: false })
    })
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
  })

  const [flipped, setFlipped] = useState([]) // up to 2 card ids
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const [finished, setFinished] = useState(false)
  const [matchedCount, setMatchedCount] = useState(0)

  const totalPairs = game.pairs.length

  const handleFlip = useCallback((cardId) => {
    if (locked || finished) return
    const card = cards.find(c => c.id === cardId)
    if (!card || card.flipped || card.matched) return
    if (flipped.length === 1 && flipped[0] === cardId) return

    play('tap')
    const newFlipped = [...flipped, cardId]

    // Flip the card
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, flipped: true } : c))
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setLocked(true)
      setMoves(m => m + 1)

      const [id1, id2] = newFlipped
      const card1 = cards.find(c => c.id === id1)
      const card2 = cards.find(c => c.id === id2)

      if (card1.pairId === card2.pairId) {
        // Match!
        play('correct')
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === id1 || c.id === id2 ? { ...c, matched: true } : c
          ))
          const newCount = matchedCount + 1
          setMatchedCount(newCount)
          setFlipped([])
          setLocked(false)
          if (newCount === totalPairs) {
            play('celebrate')
            setFinished(true)
          }
        }, 600)
      } else {
        // No match — flip back
        play('wrong')
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === id1 || c.id === id2 ? { ...c, flipped: false } : c
          ))
          setFlipped([])
          setLocked(false)
        }, 1000)
      }
    }
  }, [cards, flipped, locked, finished, matchedCount, totalPairs])

  // Stars based on moves efficiency
  const efficiency = totalPairs / moves
  const stars = efficiency > 0.7 ? 3 : efficiency > 0.5 ? 2 : 1

  const gridCols = totalPairs <= 4 ? 4 : totalPairs <= 6 ? 4 : 4

  return (
    <div className="flex flex-col gap-5">
      <CharacterSays
        char={character}
        mood={finished ? 'celebrate' : 'intro'}
        message={finished
          ? undefined
          : `Find all ${totalPairs} matching pairs! Tap to flip! 🃏`
        }
      />

      {/* Stats bar */}
      <div className="flex justify-between items-center bg-white rounded-2xl px-4 py-2.5 shadow-joy">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🎯</span>
          <span className="font-fredoka text-lg text-gray-700">{matchedCount}/{totalPairs} pairs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">👆</span>
          <span className="font-fredoka text-lg text-gray-500">{moves} moves</span>
        </div>
      </div>

      {/* Card grid */}
      <div className={`grid grid-cols-4 gap-2.5`}>
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            card={card}
            isFlipped={card.flipped || card.matched}
            isMatched={card.matched}
            onFlip={handleFlip}
          />
        ))}
      </div>

      {/* Finished overlay */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            className="bg-white rounded-3xl shadow-joy-lg p-6 text-center border-4 border-amber-200"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: 72 }}
            >
              🎉
            </motion.div>
            <h3 className="font-fredoka text-3xl text-orange-600 mt-2">You found them all!</h3>
            <p className="font-nunito text-gray-500 mt-1 font-semibold">
              Completed in {moves} moves
            </p>

            <div className="flex justify-center gap-2 my-4">
              {[1, 2, 3].map(s => (
                <motion.span
                  key={s}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + s * 0.15, type: 'spring' }}
                  style={{
                    fontSize: 44,
                    filter: s <= stars ? 'drop-shadow(0 0 8px #FFD700)' : 'grayscale(1) opacity(0.3)'
                  }}
                >⭐</motion.span>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { play('tap'); onComplete({ score: stars, correct: true }) }}
              className="joy-btn joy-btn-orange w-full text-lg mt-1"
            >
              Continue! 🚀
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MemoryCard({ card, isFlipped, isMatched, onFlip }) {
  return (
    <motion.button
      whileTap={!isFlipped ? { scale: 0.92 } : {}}
      onClick={() => onFlip(card.id)}
      className="relative focus:outline-none"
      style={{
        aspectRatio: '1',
        perspective: '600px',
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
      >
        {/* Card back */}
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center shadow"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #A7D8FF, #CDB4DB)',
            border: '2px solid rgba(255,255,255,0.5)',
          }}
        >
          <span style={{ fontSize: 28 }}>⭐</span>
        </div>

        {/* Card front */}
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center shadow-joy p-1"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: isMatched
              ? 'linear-gradient(135deg, #E8F5E9, #C8E6C9)'
              : 'linear-gradient(135deg, #FFF8E1, #FFF3E0)',
            border: isMatched
              ? '2.5px solid #43A047'
              : '2.5px solid #FFCC80',
          }}
        >
          <span className="font-fredoka text-center leading-tight"
            style={{ fontSize: card.content.length > 3 ? 11 : 22, color: isMatched ? '#1B5E20' : '#5D3A00' }}>
            {card.content}
          </span>
        </div>
      </motion.div>
    </motion.button>
  )
}
