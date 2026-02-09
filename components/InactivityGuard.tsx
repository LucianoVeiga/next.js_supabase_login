"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"

const INACTIVITY_LIMIT = 60 * 1001 * 60 // 1 hora

export default function InactivityGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(logout, INACTIVITY_LIMIT)
  }

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]

    events.forEach(event => window.addEventListener(event, resetTimer))
    resetTimer() // Iniciar el timer

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return <>{children}</>
}