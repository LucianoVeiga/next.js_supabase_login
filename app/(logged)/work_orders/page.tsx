// app/dashboard/work-orders/page.tsx
import { createClient } from "@/app/utils/supabase/server"
import { redirect } from "next/navigation"
import WorkOrdersTable from "@/components/WorkOrdersTable"

export default async function WorkOrdersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: workOrders } = await supabase
    .from("work_orders")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1>Órdenes de trabajo</h1>
      <WorkOrdersTable orders={workOrders ?? []} />
    </div>
  )
}