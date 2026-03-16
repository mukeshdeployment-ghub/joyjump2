import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterSays } from '../characters/Character'
import { play } from '../../lib/sounds'

export default function SpeedChallenge({ game, character = 'max', onComplete }) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(game.timeSeconds || 60)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const problems = game.problems
  const current = problems[idx]

  useEffect(() => {
    if (!started || finished) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0 }
        if (t <= 10) play('tick')
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, finished])

  const handleAnswer = useCallback(() => {
    if (!input.trim() || finished) return
    const answer = parseInt(input.trim(), 10)
    const correct = answer === current.a
    if (correct) { setScore(s => s + 1); play('correct'); setFeedback('correct') }
    else { play('wrong'); setFeedback('wrong') }
    setTimeout(() => {
      setFeedback(null); setInput('')
      if (idx + 1 >= problems.length) { setFinished(true); clearInterval(timerRef.current) }
      else setIdx(i => i + 1)
      inputRef.current?.focus()
    }, 400)
  }, [input, current, idx, problems.length, finished])

  const pct = Math.round((score / problems.length) * 100)
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1
  const timerColor = timeLeft > 20 ? '#43A047' : timeLeft > 10 ? '#FB8C00' : '#E53935'

  if (!started) return (
    <div className="flex flex-col gap-5 items-center text-center">
      <CharacterSays char={character} message={`Time for the ${game.title}! ${problems.length} questions in ${game.timeSeconds} seconds! Type fast! ⚡`} />
      <div className="bg-white rounded-3xl shadow-joy p-8 w-full">
        <div className="text-7xl mb-4">⚡</div>
        <h2 className="font-fredoka text-2xl text-gray-800 mb-2">{game.title}</h2>
        <p className="font-nunito text-gray-500 mb-6">{problems.length} questions · {game.timeSeconds}s</p>
        <button
          onClick={() => { play('gameStart'); setStarted(true); setTimeout(() => inputRef.current?.focus(), 100) }}
          className="joy-btn joy-btn-orange w-full text-xl"
        >Let's Go! ⚡</button>
      </div>
    </div>
  )

  if (finished) {
    const medal = pct >= 90 ? '🏆' : pct >= 60 ? '🌟' : '💪'
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-5 items-center text-center">
        <CharacterSays char={character} mood={pct >= 70 ? 'celebrate' : 'correct'} />
        <div className="bg-white rounded-3xl shadow-joy p-6 w-full">
          <div className="text-6xl mb-2">{medal}</div>
          <p className="font-fredoka text-3xl text-gray-800">{score} / {problems.length}</p>
          <p className="font-nunito text-gray-400 mb-4">{pct}% correct</p>
          <div className="flex justify-center gap-2 mb-5">
            {[1,2,3].map(s => (
              <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: s * 0.18, type: 'spring' }}
                style={{ fontSize: 40, filter: s <= stars ? 'drop-shadow(0 0 6px #FFD700)' : 'grayscale(1) opacity(0.3)' }}>
                ⭐
              </motion.span>
            ))}
          </div>
          <button onClick={() => onComplete({ score: stars, correct: pct >= 70 })}
            className="joy-btn joy-btn-orange w-full text-lg">Continue! →</button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-nunito text-sm font-bold text-gray-400">⚡ {idx + 1}/{problems.length}</span>
        <motion.div
          className="font-fredoka text-2xl font-bold px-4 py-1 rounded-2xl"
          style={{ color: timerColor, background: `${timerColor}18` }}
          animate={timeLeft <= 10 ? { scale: [1, 1.12, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >⏱ {timeLeft}s</motion.div>
        <span className="font-fredoka text-sm text-green-600 font-bold">✓ {score}</span>
      </div>

      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full"
          style={{ background: timerColor, transition: 'width 1s linear, background 0.5s ease' }}
          animate={{ width: `${(timeLeft / game.timeSeconds) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-joy p-8 text-center min-h-[220px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="w-full">
            <p className="font-nunito text-gray-400 text-sm mb-2">Question {idx + 1}</p>
            <h2 className="font-fredoka text-4xl text-gray-800 mb-6">{current.q}</h2>
            <div className="relative inline-block">
              <input ref={inputRef} type="number" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                placeholder="?" autoComplete="off"
                className={`w-36 text-center text-3xl font-fredoka py-3 rounded-2xl border-4 outline-none transition-all
                  ${feedback === 'correct' ? 'border-green-400 bg-green-50' : ''}
                  ${feedback === 'wrong' ? 'border-red-400 bg-red-50' : ''}
                  ${!feedback ? 'border-sky-200 focus:border-sky-400 bg-white' : ''}
                `}
              />
              {feedback === 'correct' && <span className="absolute -right-10 top-3 text-2xl">✅</span>}
              {feedback === 'wrong' && <span className="absolute -right-10 top-3 text-2xl">❌</span>}
            </div>
            <p className="font-nunito text-xs text-gray-300 mt-2">Press Enter or tap Go!</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button onClick={handleAnswer} disabled={!input.trim()}
        className={`joy-btn joy-btn-orange w-full text-xl ${!input.trim() ? 'opacity-40' : ''}`}>
        Go! ⚡
      </button>
    </div>
  )
}
