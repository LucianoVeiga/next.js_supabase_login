"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
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

type Employee = {
  id: string
  numero: number
  nombre: string
  apellido: string
}

type Stats = {
  totalOrders: number
  openOrders: number
  doneOrders: number
  verifiedOrders: number
  totalEmployees: number
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    openOrders: 0,
    doneOrders: 0,
    verifiedOrders: 0,
    totalEmployees: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Órdenes recientes (últimas 5)
      const { data: orders } = await supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // Conteos por estado
      const { count: totalOrders } = await supabase
        .from("work_orders")
        .select("*", { count: "exact", head: true })

      const { count: openOrders } = await supabase
        .from("work_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", 1)

      const { count: doneOrders } = await supabase
        .from("work_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", 2)

      const { count: verifiedOrders } = await supabase
        .from("work_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", 3)

      // Empleados (últimos 5)
      const { data: emps } = await supabase
        .from("empleados")
        .select("*")
        .order("nombre", { ascending: true })
        .limit(5)

      const { count: totalEmployees } = await supabase
        .from("empleados")
        .select("*", { count: "exact", head: true })

      setRecentOrders(orders ?? [])
      setEmployees(emps ?? [])
      setStats({
        totalOrders: totalOrders ?? 0,
        openOrders: openOrders ?? 0,
        doneOrders: doneOrders ?? 0,
        verifiedOrders: verifiedOrders ?? 0,
        totalEmployees: totalEmployees ?? 0,
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <p>Cargando dashboard...</p>

  return (
    <div>
      <h1>Dashboard — Admin</h1>

      {/* Métricas */}
      <section>
        <h2>Resumen</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <StatCard label="Total órdenes" value={stats.totalOrders} />
          <StatCard label="Abiertas" value={stats.openOrders} />
          <StatCard label="Realizadas" value={stats.doneOrders} />
          <StatCard label="Verificadas" value={stats.verifiedOrders} />
          <StatCard label="Empleados" value={stats.totalEmployees} />
        </div>
      </section>

      {/* Órdenes recientes */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Últimas órdenes de trabajo</h2>
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

      {/* Empleados */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Empleados</h2>
        {employees.length === 0 ? (
          <p>No hay empleados registrados</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Nombre</th>
                <th>Apellido</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.numero}</td>
                  <td>{emp.nombre}</td>
                  <td>{emp.apellido}</td>
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
          <Link href="/dashboard/empleados">
            <button>Empleados</button>
          </Link>
          <Link href="/dashboard/cuadrillas">
            <button>Cuadrillas</button>
          </Link>
          <Link href="/dashboard/usuarios">
            <button>Usuarios</button>
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