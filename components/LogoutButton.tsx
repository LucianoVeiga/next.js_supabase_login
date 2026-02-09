// components/LogoutButton.tsx
"use client"

import { createClient } from "@/app/utils/supabase/client"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return <button onClick={handleLogout}>Cerrar sesión</button>
}