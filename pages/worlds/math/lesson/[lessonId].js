import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import LessonEngine from '../../../../components/layout/LessonEngine'
import { play } from '../../../../lib/sounds'
import mathData from '../../../../data/curriculum/math-mountain.json'

function getAllLessons() {
  const lessons = []
  mathData.topics.forEach(topic =>
    topic.skills.forEach(skill =>
      skill.lessons.forEach(lesson =>
        lessons.push({ ...lesson, topicTitle: topic.title, topicEmoji: topic.emoji })
      )
    )
  )
  return lessons
}

export default function LessonPage() {
  const router = useRouter()
  const { lessonId } = router.query
  const allLessons = useMemo(() => getAllLessons(), [])
  const lesson = useMemo(() => allLessons.find(l => l.id === lessonId), [lessonId, allLessons])
  const nextLesson = useMemo(() => {
    const idx = allLessons.findIndex(l => l.id === lessonId)
    return idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null
  }, [lessonId, allLessons])

  const handleFinish = () => {
    play('tap')
    if (nextLesson) router.push(`/worlds/math/lesson/${nextLesson.id}`)
    else router.push('/worlds/math')
  }

  if (!lessonId) return <LoadingScreen />
  if (!lesson) return <NotFoundScreen />

  return (
    <div className="min-h-screen pb-8"
      style={{ background: 'linear-gradient(180deg, #FFF8DC 0%, #FFF3E0 100%)' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b-2 border-orange-100 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Link href="/worlds/math">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => play('tap')}
              className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
              ←
            </motion.button>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-nunito text-xs text-gray-400 font-bold truncate">
              {lesson.topicEmoji} {lesson.topicTitle}
            </p>
            <p className="font-fredoka text-base text-gray-800 leading-tight truncate">{lesson.title}</p>
          </div>
        </div>
      </div>

      {/* Lesson */}
      <div className="px-4 pt-5 max-w-xl mx-auto">
        <LessonEngine lesson={lesson} onFinish={handleFinish} />
      </div>

      {/* Next lesson skip */}
      {nextLesson && (
        <div className="text-center mt-6 pb-4">
          <Link href={`/worlds/math/lesson/${nextLesson.id}`}>
            <span className="font-nunito text-xs text-gray-300 hover:text-gray-400 cursor-pointer">
              Skip to next →
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: 'linear-gradient(180deg, #FFF8DC, #FFF3E0)' }}>
      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ fontSize: 60 }}>🌟</motion.span>
      <p className="font-fredoka text-xl text-orange-500">Loading your lesson...</p>
    </div>
  )
}

function NotFoundScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4"
      style={{ background: 'linear-gradient(180deg, #FFF8DC, #FFF3E0)' }}>
      <span style={{ fontSize: 64 }}>🐼</span>
      <p className="font-fredoka text-2xl text-gray-600">Hmm, can't find that lesson!</p>
      <Link href="/worlds/math">
        <button className="joy-btn joy-btn-orange mt-2">Back to Math Mountain 🏔️</button>
      </Link>
    </div>
  )
}
