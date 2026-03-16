import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJoyStore } from '../../lib/store'
import { fireConfetti } from '../../lib/confetti'
import { play } from '../../lib/sounds'
import { CharacterSays, Character } from '../characters/Character'
import GameRouter from '../games/GameRouter'
import { RewardScreen } from '../rewards/Rewards'
import { saveProgress } from '../../lib/progress'

// ── PHASES: story → teach → game → quiz → reward ─────────────────
const PHASES = ['story', 'teach', 'game', 'quiz', 'reward']
const MAX_WRONG_BEFORE_REVEAL = 3   // FIX: frustration gate

// ── FIX 3: TEACH PHASE ────────────────────────────────────────────
// Shows one worked example before the game. Uses the game's own
// first question + correct answer as the example.
function TeachPhase({ lesson, onContinue }) {
  const char = lesson.character || 'max'
  const teach = lesson.teach  // optional explicit teach block
  const game = lesson.game

  // Build a worked example from game data or use explicit teach
  const example = teach || buildExample(game)

  return (
    <div className="flex flex-col gap-5 items-center">
      <CharacterSays
        char={char}
        message="Watch me first — then you try! 👀"
        mood="intro"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 14, delay: 0.2 }}
        className="bg-white rounded-3xl shadow-joy p-6 w-full max-w-lg border-4"
        style={{ borderColor: '#A7D8FF' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">💡</span>
          <h3 className="font-fredoka text-xl text-blue-700">Worked Example</h3>
        </div>

        {/* Question */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-4">
          <p className="font-nunito font-bold text-gray-700 text-base leading-snug">
            {example.question}
          </p>
        </div>

        {/* Step-by-step thinking */}
        {example.steps && example.steps.map((step, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.25 }}
            className="flex items-start gap-3 mb-2"
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-fredoka font-bold text-sm flex items-center justify-center">{i + 1}</span>
            <p className="font-nunito text-gray-600 text-sm leading-relaxed">{step}</p>
          </motion.div>
        ))}

        {/* Answer reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + (example.steps?.length || 1) * 0.25 }}
          className="mt-4 bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-nunito text-xs text-green-500 font-bold uppercase tracking-wide">Answer</p>
            <p className="font-fredoka text-lg text-green-700">{example.answer}</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => { play('gameStart'); onContinue() }}
        className="joy-btn joy-btn-orange text-xl"
      >
        Now I'll try! 🎮
      </motion.button>
    </div>
  )
}

// Build a worked example automatically from the game data
function buildExample(game) {
  if (!game) return { question: 'Think carefully!', steps: [], answer: 'Try your best!' }

  if (game.type === 'tap_correct') {
    return {
      question: game.question,
      steps: game.hint ? [`Hint: ${game.hint}`, 'Think about which option fits best.'] : ['Read the question carefully.', 'Think about each option.'],
      answer: game.options?.[game.correct] || 'See the highlighted answer',
    }
  }
  if (game.type === 'drag_match') {
    const pair = game.pairs?.[0]
    return {
      question: game.question,
      steps: ['Look at the first item on the left.', `"${pair?.item}" matches with "${pair?.match}"`, game.hint || 'Think about what goes together!'],
      answer: `${pair?.item} → ${pair?.match}`,
    }
  }
  if (game.type === 'speed_challenge') {
    const first = game.problems?.[0]
    return {
      question: 'Let\'s practise one together first.',
      steps: [first ? `Try: ${first.q}` : 'Read each question carefully.', 'Type your answer quickly!', game.timeSeconds ? `You have ${game.timeSeconds} seconds total.` : ''],
      answer: first ? `${first.q} ${first.a}` : 'Type your answer and press Enter!',
    }
  }
  if (game.type === 'sorting') {
    const ex = game.items?.[0]
    const catName = ex ? game.categories?.[ex.category] : game.categories?.[0]
    return {
      question: game.question,
      steps: [
        `Look at each item and think about which group it belongs to.`,
        ex ? `For example: "${ex.name}" belongs in "${catName}"` : game.hint || 'Drag each item to the right group.',
      ],
      answer: ex ? `"${ex.name}" → ${catName}` : 'Drag into the correct group!',
    }
  }
  if (game.type === 'memory_match') {
    return {
      question: 'Find the matching pairs by flipping cards.',
      steps: ['Tap any card to flip it over.', 'Tap a second card — if they match, they stay!', 'Remember where cards are to find pairs faster.'],
      answer: 'Match all the pairs to win!',
    }
  }
  return {
    question: game.question || 'Let\'s look at an example.',
    steps: [game.hint || 'Think carefully about each option.'],
    answer: game.options?.[game.correct] || 'Try your best!',
  }
}

// ── STORY PHASE ────────────────────────────────────────────────────
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
          onClick={() => { play('tap'); onContinue() }}
          className="joy-btn joy-btn-orange text-xl"
        >
          See the Example! 💡
        </motion.button>
      )}
    </div>
  )
}

// ── FIX: QUIZ with frustration gate ───────────────────────────────
function QuizPhase({ quiz, character, onComplete }) {
  const [qi, setQi] = useState(0)
  const [sel, setSel] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState([])
  const [wrongStreak, setWrongStreak] = useState(0)  // FIX: frustration gate
  const [autoRevealed, setAutoRevealed] = useState(false)
  const q = quiz[qi]
  const isLast = qi === quiz.length - 1
  const isCorrect = sel === q?.correct

  const handleSelect = (idx) => {
    if (answered) return
    const correct = idx === q.correct
    setSel(idx)
    setAnswered(true)
    play(correct ? 'correct' : 'wrong')
    if (!correct) {
      const newStreak = wrongStreak + 1
      setWrongStreak(newStreak)
    } else {
      setWrongStreak(0)
    }
  }

  // FIX: auto-reveal after MAX_WRONG_BEFORE_REVEAL wrong answers
  useEffect(() => {
    if (!answered && wrongStreak >= MAX_WRONG_BEFORE_REVEAL) {
      setSel(-1) // special: show correct without wrong highlight
      setAnswered(true)
      setAutoRevealed(true)
    }
  }, [wrongStreak, answered])

  const handleNext = () => {
    const updated = [...answers, { correct: isCorrect && !autoRevealed }]
    setAnswers(updated)
    setAutoRevealed(false)
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
      <div className="flex justify-center gap-2">
        {quiz.map((_, i) => (
          <motion.div key={i} className="w-3 h-3 rounded-full transition-all"
            style={{ background: i < qi ? '#43A047' : i === qi ? '#FB8C00' : '#E5E7EB' }}
            animate={i === qi ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.4 }}
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
              className={`answer-option ${answered && i === q.correct ? 'correct' : ''} ${answered && i === sel && i !== q.correct && sel !== -1 ? 'wrong' : ''}`}
            >
              <span className="inline-flex w-7 h-7 rounded-full items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0"
                style={{ background: answered && i === q.correct ? '#43A047' : answered && i === sel && sel !== -1 ? '#E53935' : '#9E9E9E', fontSize: 12 }}>
                {answered && i === q.correct ? '✓' : answered && i === sel && sel !== -1 ? '✗' : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>

      {answered && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 text-center ${isCorrect && !autoRevealed ? 'bg-green-50 border-2 border-green-200' : 'bg-blue-50 border-2 border-blue-200'}`}>
          <p className="font-fredoka text-xl mb-3">
            {autoRevealed
              ? `💡 That was tricky! The answer is "${q.options[q.correct]}" — let's keep going!`
              : isCorrect ? '✅ Correct!' : `The answer was: "${q.options[q.correct]}"`}
          </p>
          <button onClick={handleNext} className="joy-btn joy-btn-orange text-base py-3 px-8">
            {isLast ? 'Finish Quiz! 🎉' : 'Next Question →'}
          </button>
        </motion.div>
      )}
    </div>
  )
}

// ── MAIN ENGINE ────────────────────────────────────────────────────
export default function LessonEngine({ lesson, onFinish }) {
  const [phase, setPhase] = useState(0)
  const [gameScore, setGameScore] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const sessionStart = useRef(Date.now())  // FIX: session timer

  const { addStars, addCoins, addBadge, markComplete, childId } = useJoyStore()

  const phaseLabel = (p) => ({ story: 'Story', teach: 'Learn', game: 'Game', quiz: 'Quiz' }[p] || 'Done')
  const phaseIcon  = (p) => ({ story: '📖', teach: '💡', game: '🎮', quiz: '🎯' }[p] || '🎉')

  const goToPhase = useCallback((phaseIdx) => {
    if (phaseIdx === 2 && !lesson.game) { setPhase(3); return }
    if (phaseIdx === 3 && !lesson.quiz) {
      const stars = Math.max(1, gameScore)
      addStars(stars); addCoins(lesson.rewards?.coins || 10)
      if (lesson.rewards?.badge) addBadge(lesson.rewards.badge)
      markComplete(lesson.id, stars)
      // FIX: Supabase save
      const timeSpent = Math.round((Date.now() - sessionStart.current) / 1000)
      saveProgress({ childId, lessonId: lesson.id, score: stars, timeSpent, phaseData: { gameScore: stars } }).catch(() => {})
      fireConfetti('side').then(() => { play('star'); setShowReward(true) })
      return
    }
    setPhase(phaseIdx)
  }, [lesson, gameScore, addStars, addCoins, addBadge, markComplete, child])

  const handleGameDone = useCallback(({ score }) => {
    play('tap'); setGameScore(score); goToPhase(3)
  }, [goToPhase])

  const handleQuizDone = useCallback(async ({ score }) => {
    setQuizScore(score)
    const totalStars = Math.max(1, Math.round((gameScore + score) / 2))
    addStars(totalStars)
    addCoins(lesson.rewards?.coins || 10)
    if (lesson.rewards?.badge) addBadge(lesson.rewards.badge)
    markComplete(lesson.id, totalStars)

    // FIX: wire Supabase — non-blocking, silent failure OK
    const timeSpent = Math.round((Date.now() - sessionStart.current) / 1000)
    saveProgress({ childId, lessonId: lesson.id, score: totalStars, timeSpent, phaseData: { gameScore, quizScore: score } }).catch(() => {})

    await fireConfetti('side')
    play('star')
    setShowReward(true)
  }, [gameScore, lesson, addStars, addCoins, addBadge, markComplete, child])

  const handleRewardDone = useCallback(() => {
    onFinish({ stars: Math.round((gameScore + quizScore) / 2) })
  }, [gameScore, quizScore, onFinish])

  const character = lesson.character || 'max'
  const currentPhase = PHASES[phase]
  const visiblePhases = ['story', 'teach', 'game', 'quiz']

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Phase bar — now 4 steps */}
      <div className="flex justify-center gap-1.5 mb-5 flex-wrap">
        {visiblePhases.map((p, i) => (
          <div key={p} className={`phase-pill transition-all ${
            i === phase ? 'text-white shadow' : i < phase ? 'text-white' : 'text-gray-400 bg-gray-100'
          }`}
            style={i <= phase ? {
              background: i < phase ? 'linear-gradient(135deg, #43A047, #1B5E20)' : 'linear-gradient(135deg, #FB8C00, #E65100)',
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
          {currentPhase === 'story' && (
            <StoryPhase lesson={lesson} onContinue={() => setPhase(1)} />
          )}
          {currentPhase === 'teach' && (
            <TeachPhase lesson={lesson} onContinue={() => goToPhase(2)} />
          )}
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
