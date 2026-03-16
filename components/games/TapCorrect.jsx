import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterSays } from '../characters/Character'
import { MicroFeedback } from '../rewards/Rewards'
import { play } from '../../lib/sounds'
import { fireConfetti } from '../../lib/confetti'

export default function TapCorrect({ game, character = 'max', onComplete }) {
  const [selected, setSelected] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const isCorrect = selected === game.correct
  const isAnswered = selected !== null

  const handleSelect = useCallback(async (idx) => {
    if (isAnswered) return
    setSelected(idx)
    setAttempts(a => a + 1)
    setShowFeedback(true)

    if (idx === game.correct) {
      play('correct')
      await fireConfetti('stars')
    } else {
      play('wrong')
    }

    setTimeout(() => setShowFeedback(false), 1200)
  }, [isAnswered, game.correct])

  const handleRetry = useCallback(() => {
    setSelected(null)
    setShowHint(true)
  }, [])

  const handleNext = useCallback(() => {
    play('tap')
    const score = attempts <= 1 ? 3 : attempts === 2 ? 2 : 1
    onComplete({ score, correct: isCorrect })
  }, [attempts, isCorrect, onComplete])

  const optionColors = [
    { bg: '#FFF3E0', border: '#FFCC80', selected: '#FB8C00', text: '#E65100' },
    { bg: '#E8F5E9', border: '#A5D6A7', selected: '#43A047', text: '#1B5E20' },
    { bg: '#E3F2FD', border: '#90CAF9', selected: '#1E88E5', text: '#0D47A1' },
    { bg: '#EDE7F6', border: '#CE93D8', selected: '#7B1FA2', text: '#4A148C' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <CharacterSays
        char={character}
        mood={!isAnswered ? 'intro' : isCorrect ? 'correct' : 'wrong'}
      />

      {/* Hint */}
      <AnimatePresence>
        {showHint && !isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex gap-3 overflow-hidden"
          >
            <motion.span
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              className="text-2xl flex-shrink-0"
            >
              💡
            </motion.span>
            <p className="font-nunito font-bold text-amber-900 text-base">{game.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question card */}
      <div className="bg-white rounded-3xl shadow-joy p-6">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-fredoka text-2xl text-center text-gray-800 mb-6 leading-snug"
        >
          {game.question}
        </motion.h2>

        {/* Options grid */}
        <div className={`grid gap-3 ${game.options.length <= 2 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {game.options.map((option, idx) => {
            const col = optionColors[idx % optionColors.length]
            const isSelected = selected === idx
            const isWrong = isAnswered && isSelected && idx !== game.correct
            const isRight = isAnswered && idx === game.correct

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.07, type: 'spring', damping: 12 }}
                whileHover={!isAnswered ? { scale: 1.03, x: 4 } : {}}
                whileTap={!isAnswered ? { scale: 0.96 } : {}}
                onClick={() => { play('tap'); handleSelect(idx) }}
                disabled={isAnswered}
                className="answer-option relative overflow-hidden"
                style={{
                  background: isRight
                    ? 'linear-gradient(135deg, #E8F5E9, #F1F8F1)'
                    : isWrong
                    ? 'linear-gradient(135deg, #FFEBEE, #FFF5F5)'
                    : !isAnswered ? `linear-gradient(135deg, white, ${col.bg})`
                    : 'white',
                  borderColor: isRight ? '#43A047'
                    : isWrong ? '#E53935'
                    : !isAnswered ? col.border
                    : '#E5E7EB',
                }}
              >
                {/* Option letter badge */}
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mr-3 flex-shrink-0"
                  style={{
                    background: isRight ? '#43A047' : isWrong ? '#E53935' : col.selected,
                    color: 'white',
                    fontSize: 13,
                  }}
                >
                  {isRight ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + idx)}
                </span>

                <span style={{ color: isRight ? '#1B5E20' : isWrong ? '#B71C1C' : col.text }}>
                  {option}
                </span>

                {/* Correct ripple effect */}
                {isRight && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: 'rgba(67, 160, 71, 0.15)' }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Feedback */}
      <MicroFeedback type={isCorrect ? 'correct' : 'wrong'} visible={showFeedback && isAnswered} />

      {/* Action area */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 text-center ${
              isCorrect
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-orange-50 border-2 border-orange-200'
            }`}
          >
            <p className="font-fredoka text-xl mb-3">
              {isCorrect
                ? '🎉 Brilliant! That\'s right!'
                : `The answer was: "${game.options[game.correct]}"`}
            </p>
            <div className="flex gap-3 justify-center">
              {!isCorrect && (
                <button onClick={handleRetry}
                  className="joy-btn text-base py-3 px-6"
                  style={{ background: 'linear-gradient(135deg, #FFB74D, #FF8F00)' }}>
                  Try Again 🔄
                </button>
              )}
              <button onClick={handleNext}
                className="joy-btn joy-btn-orange text-base py-3 px-8">
                {isCorrect ? 'Next! →' : 'Continue →'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint link */}
      {!isAnswered && !showHint && (
        <button
          onClick={() => { play('tap'); setShowHint(true) }}
          className="font-nunito text-sm text-gray-400 hover:text-gray-600 underline text-center"
        >
          Need a hint? 💡
        </button>
      )}
    </div>
  )
}
