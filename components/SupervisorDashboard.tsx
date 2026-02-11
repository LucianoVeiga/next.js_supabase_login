"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

const STATUS_LABELS: Record<number, string> = {
  1: "Abierta",
  2: "Realizada",
  3: "Verificada",
}

type WorkOrder = {
  id: string
  title: string
  description: string | null
  status: number
  created_at: string
}

type Stats = {
  totalAssigned: number
  pendingReview: number
  completed: number
}

export default function SupervisorDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [pendingOrders, setPendingOrders] = useState<WorkOrder[]>([])
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([])
  const [stats, setStats] = useState<Stats>({
    totalAssigned: 0,
    pendingReview: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Órdenes pendientes de revisión (status = 1, las que el supervisor puede avanzar)
      const { data: pending } = await supabase
        .from("work_orders")
        .select("*")
        .eq("status", 1)
        .order("created_at", { ascending: false })
        .limit(10)

      // Órdenes recientes (todas, últimas 5)
      const { data: recent } = await supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // Conteos
      const { count: totalAssigned } = await supabase
        .from("work_orders")
        .select("*", { count: "exact", head: true })

      const { count: pendingReview } = await supabase
        .from("work_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", 1)

      const { count: completed } = await supabase
        .from("work_orders")
        .select("*", { count: "exact", head: true })
        .in("status", [2, 3])

      setPendingOrders(pending ?? [])
      setRecentOrders(recent ?? [])
      setStats({
        totalAssigned: totalAssigned ?? 0,
        pendingReview: pendingReview ?? 0,
        completed: completed ?? 0,
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleAdvance = async (order: WorkOrder) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("work_orders")
      .update({
        status: 2,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)

    if (error) {
      console.error("Error al avanzar orden:", error)
      return
    }

    // Refrescar datos
    router.refresh()
    // Actualizar estado local
    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id))
    setStats((prev) => ({
      ...prev,
      pendingReview: prev.pendingReview - 1,
      completed: prev.completed + 1,
    }))
  }

  if (loading) return <p>Cargando dashboard...</p>

  return (
    <div>
      <h1>Dashboard — Supervisor</h1>

      {/* Métricas */}
      <section>
        <h2>Resumen</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <StatCard label="Total órdenes" value={stats.totalAssigned} />
          <StatCard label="Pendientes de revisión" value={stats.pendingReview} />
          <StatCard label="Completadas" value={stats.completed} />
        </div>
      </section>

      {/* Órdenes pendientes de revisión */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Órdenes pendientes de revisión</h2>
        {pendingOrders.length === 0 ? (
          <p>No hay órdenes pendientes</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.title}</td>
                  <td>{order.description ?? "-"}</td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td>
                    <button onClick={() => handleAdvance(order)}>
                      Marcar como realizada
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Resumen de órdenes recientes */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Órdenes recientes</h2>
        {recentOrders.length === 0 ? (
          <p>No hay órdenes de trabajo</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.title}</td>
                  <td>{STATUS_LABELS[order.status]}</td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Accesos rápidos */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Accesos rápidos</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/dashboard/work-orders">
            <button>Órdenes de trabajo</button>
          </Link>
          <Link href="/dashboard/cuadrillas">
            <button>Cuadrillas</button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "1rem 1.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        minWidth: "140px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
        {value}
      </p>
      <p style={{ fontSize: "0.875rem", color: "#666", margin: 0 }}>
        {label}
      </p>
    </div>
  )
}