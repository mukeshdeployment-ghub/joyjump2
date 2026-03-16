import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import LessonEngine from '../../../../components/layout/LessonEngine'
import { play } from '../../../../lib/sounds'
import hindiData from '../../../../data/curriculum/hindi-world.json'

function getAllLessons() {
  const lessons = []
  hindiData.topics.forEach(t => t.skills.forEach(sk => sk.lessons.forEach(l =>
    lessons.push({ ...l, topicTitle: t.title, topicEmoji: t.emoji })
  )))
  return lessons
}

export default function HindiLessonPage() {
  const router = useRouter()
  const { lessonId } = router.query
  const allLessons = useMemo(() => getAllLessons(), [])
  const lesson = useMemo(() => allLessons.find(l => l.id === lessonId), [lessonId, allLessons])
  const nextLesson = useMemo(() => {
    const idx = allLessons.findIndex(l => l.id === lessonId)
    return idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null
  }, [lessonId, allLessons])

  if (!lessonId) return <Loading />
  if (!lesson) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4"
      style={{ background: 'linear-gradient(180deg, #FFF8E1, #FFFDE7)' }}>
      <span style={{ fontSize: 64 }}>🐰</span>
      <p className="font-fredoka text-2xl text-gray-600">Lesson not found!</p>
      <Link href="/worlds/hindi"><button className="joy-btn mt-2 text-base py-3 px-6"
        style={{ background: 'linear-gradient(135deg, #F57F17, #BF360C)' }}>Back to Hindi World 🏵️</button></Link>
    </div>
  )

  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(180deg, #FFF8E1, #FFFDE7)' }}>
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b-2 border-amber-100 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Link href="/worlds/hindi">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => play('tap')}
              className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl">←</motion.button>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-nunito text-xs text-gray-400 font-bold truncate">{lesson.topicEmoji} {lesson.topicTitle}</p>
            <p className="font-fredoka text-base text-gray-800 leading-tight truncate">{lesson.title}</p>
          </div>
        </div>
      </div>
      <div className="px-4 pt-5 max-w-xl mx-auto">
        <LessonEngine lesson={lesson} onFinish={() => {
          play('tap')
          if (nextLesson) router.push(`/worlds/hindi/lesson/${nextLesson.id}`)
          else router.push('/worlds/hindi')
        }} />
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFF8E1, #FFFDE7)' }}>
      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 60 }}>🌟</motion.span>
    </div>
  )
}
