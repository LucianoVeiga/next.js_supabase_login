import { createClient } from "@/app/utils/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/AdminDashboard"
import SupervisorDashboard from "@/components/SupervisorDashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data } = await supabase
    .from("users")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (!data?.rol) redirect("/login")

  if (data.rol === "admin") return <AdminDashboard />
  if (data.rol === "supervisor") return <SupervisorDashboard />

  redirect("/login")
}