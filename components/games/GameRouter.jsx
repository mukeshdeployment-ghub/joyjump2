import dynamic from 'next/dynamic'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterSays } from '../characters/Character'
import { play } from '../../lib/sounds'

const TapCorrect = dynamic(() => import('./TapCorrect'), { ssr: false })
const TouchDragMatch = dynamic(() => import('./TouchDragMatch'), { ssr: false })
const SpeedChallenge = dynamic(() => import('./SpeedChallenge'), { ssr: false })
const SortingGame = dynamic(() => import('./SortingGame'), { ssr: false })
const MemoryMatch = dynamic(() => import('./MemoryMatch'), { ssr: false })

// Inline simple games for sequence and counting
function SequenceGame({ game, character, onComplete }) {
  const [sel, setSel] = useState(null)
  const isCorrect = sel === game.correct
  const answered = sel !== null
  return (
    <div className="flex flex-col gap-5">
      <CharacterSays char={character} mood={!answered ? 'intro' : isCorrect ? 'correct' : 'wrong'} />
      <div className="bg-white rounded-3xl shadow-joy p-6">
        <h2 className="font-fredoka text-2xl text-center text-gray-800 mb-6">{game.question}</h2>
        <div className="grid grid-cols-2 gap-3">
          {game.options.map((opt, i) => (
            <motion.button key={i} whileHover={!answered ? { scale: 1.04 } : {}} whileTap={!answered ? { scale: 0.96 } : {}}
              onClick={() => { if (!answered) { play(i === game.correct ? 'correct' : 'wrong'); setSel(i) } }}
              className={`answer-option ${answered && i === game.correct ? 'correct' : ''} ${answered && i === sel && i !== game.correct ? 'wrong' : ''}`}
            >{opt}</motion.button>
          ))}
        </div>
        {game.hint && <div className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 flex gap-2">
          <span>💡</span><p className="font-nunito text-sm font-bold text-amber-800">{game.hint}</p></div>}
      </div>
      {answered && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 text-center ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
          <p className="font-fredoka text-xl mb-3">{isCorrect ? '🎉 Correct!' : '💪 Try again!'}</p>
          <div className="flex gap-3 justify-center">
            {!isCorrect && <button onClick={() => setSel(null)}
              className="joy-btn text-base py-3 px-5" style={{ background: 'linear-gradient(135deg, #FFB74D, #FF8F00)' }}>Try Again 🔄</button>}
            <button onClick={() => onComplete({ score: isCorrect ? 3 : 1, correct: isCorrect })}
              className="joy-btn joy-btn-orange text-base py-3 px-8">Continue →</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function CountingBasket({ game, character, onComplete }) {
  const [sel, setSel] = useState(null)
  const isCorrect = sel === game.correct
  const answered = sel !== null
  return (
    <div className="flex flex-col gap-5">
      <CharacterSays char={character} mood={!answered ? 'intro' : isCorrect ? 'correct' : 'wrong'} />
      <div className="bg-white rounded-3xl shadow-joy p-6">
        <div className="text-center mb-4">
          <motion.span style={{ fontSize: 60 }} animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>🧺</motion.span>
          <h2 className="font-fredoka text-xl text-gray-800 mt-3">{game.question}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {game.options.map((opt, i) => (
            <motion.button key={i} whileHover={!answered ? { scale: 1.04 } : {}} whileTap={!answered ? { scale: 0.96 } : {}}
              onClick={() => { if (!answered) { play(i === game.correct ? 'correct' : 'wrong'); setSel(i) } }}
              disabled={answered}
              className={`answer-option ${answered && i === game.correct ? 'correct' : ''} ${answered && i === sel && i !== game.correct ? 'wrong' : ''}`}
            >{opt}</motion.button>
          ))}
        </div>
        {game.hint && !answered && <div className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 flex gap-2">
          <span>💡</span><p className="font-nunito text-sm font-bold text-amber-800">{game.hint}</p></div>}
      </div>
      {answered && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 text-center ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
          <p className="font-fredoka text-xl mb-3">{isCorrect ? '🎉 Correct!' : '💪 Try again!'}</p>
          <div className="flex gap-3 justify-center">
            {!isCorrect && <button onClick={() => setSel(null)}
              className="joy-btn text-base py-3 px-5" style={{ background: 'linear-gradient(135deg, #FFB74D, #FF8F00)' }}>Try Again 🔄</button>}
            <button onClick={() => onComplete({ score: isCorrect ? 3 : 1, correct: isCorrect })}
              className="joy-btn joy-btn-orange text-base py-3 px-8">Continue →</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function GameRouter({ game, character = 'max', onComplete }) {
  if (!game) return (
    <div className="bg-white rounded-3xl p-8 text-center">
      <p className="font-fredoka text-xl text-gray-400">No game loaded</p>
    </div>
  )
  const props = { game, character, onComplete }
  switch (game.type) {
    case 'tap_correct':      return <TapCorrect {...props} />
    case 'drag_match':       return <TouchDragMatch {...props} />
    case 'speed_challenge':  return <SpeedChallenge {...props} />
    case 'sorting':          return <SortingGame {...props} />
    case 'sequence':         return <SequenceGame {...props} />
    case 'counting_basket':  return <CountingBasket {...props} />
    case 'memory_match':     return <MemoryMatch {...props} />
    default:                 return <TapCorrect {...props} />
  }
}
