"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import type { Role } from "@/config/permissions"

export function useRole() {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data } = await supabase
        .from("users")
        .select("rol")
        .eq("id", user.id)
        .single()

      setRole(data?.rol ?? null)
      setLoading(false)
    }
    fetchRole()
  }, [])

  return {
    role,
    loading,
    isAdmin: role === "admin",
    isSupervisor: role === "supervisor",
  }
}