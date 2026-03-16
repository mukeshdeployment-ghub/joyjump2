import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJoyStore } from '../../lib/store'
import { fireConfetti } from '../../lib/confetti'
import { play } from '../../lib/sounds'
import { CharacterSays, Character } from '../characters/Character'
import GameRouter from '../games/GameRouter'
import { RewardScreen, ProgressBar } from '../rewards/Rewards'

const PHASES = ['story', 'game', 'quiz', 'reward']

// Quiz phase
function QuizPhase({ quiz, character, onComplete }) {
  const [qi, setQi] = useState(0)
  const [sel, setSel] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState([])
  const q = quiz[qi]
  const isLast = qi === quiz.length - 1
  const isCorrect = sel === q?.correct

  const handleSelect = (idx) => {
    if (answered) return
    setSel(idx)
    setAnswered(true)
    play(idx === q.correct ? 'correct' : 'wrong')
  }

  const handleNext = () => {
    const updated = [...answers, { correct: isCorrect }]
    setAnswers(updated)
    if (isLast) {
      const score = Math.round((updated.filter(a => a.correct).length / quiz.length) * 3)
      onComplete({ score, correct: score >= 2 })
    } else {
      setQi(i => i + 1); setSel(null); setAnswered(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <CharacterSays char={character} message={`Quiz time! Question ${qi + 1} of ${quiz.length} 🎯`} />

      {/* Dot progress */}
      <div className="flex justify-center gap-2">
        {quiz.map((_, i) => (
          <motion.div key={i} className="w-3 h-3 rounded-full transition-all"
            style={{ background: i < qi ? '#43A047' : i === qi ? '#FB8C00' : '#E5E7EB' }}
            animate={i === qi ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-joy p-6">
        <AnimatePresence mode="wait">
          <motion.p key={qi} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="font-fredoka text-xl text-center text-gray-800 mb-5 leading-snug"
          >{q.q}</motion.p>
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => (
            <motion.button key={i}
              whileHover={!answered ? { x: 6, scale: 1.02 } : {}}
              whileTap={!answered ? { scale: 0.97 } : {}}
              onClick={() => { play('tap'); handleSelect(i) }}
              disabled={answered}
              className={`answer-option ${answered && i === q.correct ? 'correct' : ''} ${answered && i === sel && i !== q.correct ? 'wrong' : ''}`}
            >
              <span className="inline-flex w-7 h-7 rounded-full items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0"
                style={{ background: answered && i === q.correct ? '#43A047' : answered && i === sel ? '#E53935' : '#9E9E9E', fontSize: 12 }}>
                {answered && i === q.correct ? '✓' : answered && i === sel ? '✗' : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>

      {answered && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 text-center ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
          <p className="font-fredoka text-xl mb-3">
            {isCorrect ? '✅ Correct!' : `The answer was: "${q.options[q.correct]}"`}
          </p>
          <button onClick={handleNext} className="joy-btn joy-btn-orange text-base py-3 px-8">
            {isLast ? 'Finish Quiz! 🎉' : 'Next Question →'}
          </button>
        </motion.div>
      )}
    </div>
  )
}

// Story phase  
function StoryPhase({ lesson, onContinue }) {
  const [shown, setShown] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShown(true), 200); return () => clearTimeout(t) }, [])
  const char = lesson.character || 'max'

  return (
    <div className="flex flex-col gap-6 items-center">
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
        <Character char={char} size={130} mood="idle" />
      </motion.div>

      <AnimatePresence>
        {shown && (
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 14 }}
            className="bg-white rounded-3xl shadow-joy border-2 p-6 max-w-lg w-full"
            style={{ borderColor: 'rgba(167,216,255,0.6)' }}
          >
            <h2 className="font-fredoka text-2xl text-orange-600 mb-3 text-center">{lesson.title}</h2>
            <p className="font-nunito text-gray-700 text-lg leading-relaxed">{lesson.story}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {shown && (
        <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { play('gameStart'); onContinue() }}
          className="joy-btn joy-btn-orange text-xl"
        >
          Let's Play! 🎮
        </motion.button>
      )}
    </div>
  )
}

// Main engine
export default function LessonEngine({ lesson, onFinish }) {
  const [phase, setPhase] = useState(0)
  const [gameScore, setGameScore] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const { addStars, addCoins, addBadge, markComplete } = useJoyStore()

  const phaseLabel = (p) => p === 'story' ? 'Story' : p === 'game' ? 'Game' : p === 'quiz' ? 'Quiz' : 'Done'
  const phaseIcon = (p) => p === 'story' ? '📖' : p === 'game' ? '🎮' : p === 'quiz' ? '🎯' : '🎉'

  // Skip phases that have no content (some lessons have no game or quiz)
  const goToPhase = useCallback((phaseIdx) => {
    // phase 1=game, 2=quiz — skip if content missing
    if (phaseIdx === 1 && !lesson.game) { setPhase(2); return }
    if (phaseIdx === 2 && !lesson.quiz) {
      // No quiz — go straight to reward
      const stars = Math.max(1, gameScore)
      addStars(stars); addCoins(lesson.rewards?.coins || 10)
      if (lesson.rewards?.badge) addBadge(lesson.rewards.badge)
      markComplete(lesson.id, stars)
      fireConfetti('side').then(() => { play('star'); setShowReward(true) })
      return
    }
    setPhase(phaseIdx)
  }, [lesson, gameScore, addStars, addCoins, addBadge, markComplete])

  const handleGameDone = useCallback(({ score }) => {
    play('tap'); setGameScore(score); goToPhase(2)
  }, [goToPhase])

  const handleQuizDone = useCallback(async ({ score }) => {
    setQuizScore(score)
    const totalStars = Math.max(1, Math.round((gameScore + score) / 2))
    addStars(totalStars)
    addCoins(lesson.rewards?.coins || 10)
    if (lesson.rewards?.badge) addBadge(lesson.rewards.badge)
    markComplete(lesson.id, totalStars)
    await fireConfetti('side')
    play('star')
    setShowReward(true)
  }, [gameScore, lesson, addStars, addCoins, addBadge, markComplete])

  const handleRewardDone = useCallback(() => {
    onFinish({ stars: Math.round((gameScore + quizScore) / 2) })
  }, [gameScore, quizScore, onFinish])

  const character = lesson.character || 'max'
  const currentPhase = PHASES[phase]

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Phase bar */}
      <div className="flex justify-center gap-2 mb-5">
        {PHASES.slice(0, 3).map((p, i) => (
          <div key={p} className={`phase-pill transition-all ${
            i === phase ? 'text-white shadow' : i < phase ? 'text-white' : 'text-gray-400 bg-gray-100'
          }`}
            style={i <= phase ? {
              background: i < phase
                ? 'linear-gradient(135deg, #43A047, #1B5E20)'
                : 'linear-gradient(135deg, #FB8C00, #E65100)',
            } : {}}
          >
            <span>{phaseIcon(p)}</span>
            <span>{phaseLabel(p)}</span>
            {i < phase && <span>✓</span>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentPhase}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
        >
          {currentPhase === 'story' && <StoryPhase lesson={lesson} onContinue={() => goToPhase(1)} />}
          {currentPhase === 'game' && lesson.game && (
            <GameRouter game={lesson.game} character={character} onComplete={handleGameDone} />
          )}
          {currentPhase === 'quiz' && lesson.quiz && (
            <QuizPhase quiz={lesson.quiz} character={character} onComplete={handleQuizDone} />
          )}
        </motion.div>
      </AnimatePresence>

      {showReward && (
        <RewardScreen
          stars={Math.round((gameScore + quizScore) / 2)}
          coins={lesson.rewards?.coins || 10}
          badge={lesson.rewards?.badge || null}
          character={character}
          onContinue={handleRewardDone}
        />
      )}
    </div>
  )
}
