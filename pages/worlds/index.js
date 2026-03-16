import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function WorldsIndex() {
  const router = useRouter()
  useEffect(() => { router.replace('/') }, [])
  return null
}
