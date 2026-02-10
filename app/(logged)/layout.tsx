import { createClient } from "@/app/utils/supabase/server"
import { redirect } from "next/navigation"
import Navbar from "@/components/NavBar"
import InactivityGuard from "@/components/InactivityGuard"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <InactivityGuard>
      <Navbar />
      <main>{children}</main>
    </InactivityGuard>
  )
}