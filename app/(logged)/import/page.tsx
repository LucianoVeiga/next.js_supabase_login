import { createClient } from "@/app/utils/supabase/server"
import { redirect } from "next/navigation"
import CSVImporter from "@/components/CSVImporter"

export default async function ImportPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data } = await supabase
    .from("users")
    .select("rol")
    .eq("id", user.id)
    .single()

  // Solo supremo puede importar
  if (data?.rol !== "supremo") redirect("/dashboard")

  return (
    <div>
      <h1>Importar datos</h1>
      <CSVImporter />
    </div>
  )
}