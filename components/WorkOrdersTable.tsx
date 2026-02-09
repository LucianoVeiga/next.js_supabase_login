"use client"

import { useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useRole } from "@/hooks/useRole"
import { can, canAdvance, STATUS_LABELS, getNextStatusLabel } from "@/config/permissions"

type WorkOrder = {
  id: string
  title: string
  description: string | null
  status: number
  created_at: string
}

export default function WorkOrdersTable({ orders }: { orders: WorkOrder[] }) {
  const { role, loading } = useRole()
  const supabase = createClient()
  const router = useRouter()

  const [showCreate, setShowCreate] = useState(false)
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null)
  const [detailOrder, setDetailOrder] = useState<WorkOrder | null>(null)

  // --- Avanzar estado ---
  const handleAdvance = async (order: WorkOrder) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("work_orders")
      .update({
        status: order.status + 1,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)

    if (error) return console.error("Error:", error)
    router.refresh()
  }

  // --- Crear orden ---
  const handleCreate = async (title: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("work_orders")
      .insert({
        title,
        description,
        status: 1,
        created_by: user?.id,
      })

    if (error) return console.error("Error:", error)
    setShowCreate(false)
    router.refresh()
  }

  // --- Editar orden ---
  const handleEdit = async (id: string, title: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("work_orders")
      .update({
        title,
        description,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) return console.error("Error:", error)
    setEditingOrder(null)
    router.refresh()
  }

  // --- Eliminar orden ---
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta orden?")) return

    const { error } = await supabase
      .from("work_orders")
      .delete()
      .eq("id", id)

    if (error) return console.error("Error:", error)
    router.refresh()
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      {/* Botón crear */}
      {can(role, "work_orders", "create") && (
        <button onClick={() => setShowCreate(true)}>+ Nueva orden</button>
      )}

      {/* Modal crear */}
      {showCreate && (
        <CreateModal
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Modal editar */}
      {editingOrder && (
        <EditModal
          order={editingOrder}
          onSubmit={handleEdit}
          onCancel={() => setEditingOrder(null)}
        />
      )}

      {/* Modal detalle */}
      {detailOrder && (
        <DetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}

      {/* Tabla */}
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.title}</td>
              <td>{order.description ?? "-"}</td>
              <td>{STATUS_LABELS[order.status]}</td>
              <td>{new Date(order.created_at).toLocaleDateString("es-AR")}</td>
              <td>
                {can(role, "work_orders", "detail") && (
                  <button onClick={() => setDetailOrder(order)}>
                    Ver detalle
                  </button>
                )}

                {can(role, "work_orders", "edit") && order.status !== 3 && (
                  <button onClick={() => setEditingOrder(order)}>
                    Editar
                  </button>
                )}

                {canAdvance(role, order.status) && (
                  <button onClick={() => handleAdvance(order)}>
                    Pasar a: {getNextStatusLabel(order.status)}
                  </button>
                )}

                {can(role, "work_orders", "delete") && (
                  <button onClick={() => handleDelete(order.id)}>
                    Eliminar
                  </button>
                )}

                {order.status === 3 && <span>✓ Verificada</span>}
              </td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr>
              <td colSpan={5}>No hay órdenes de trabajo</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ---------- Modales ----------

function CreateModal({
  onSubmit,
  onCancel,
}: {
  onSubmit: (title: string, description: string) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Nueva orden de trabajo</h3>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <button onClick={() => onSubmit(title, description)} disabled={!title}>
            Crear
          </button>
          <button onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function EditModal({
  order,
  onSubmit,
  onCancel,
}: {
  order: WorkOrder
  onSubmit: (id: string, title: string, description: string) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(order.title)
  const [description, setDescription] = useState(order.description ?? "")

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar orden</h3>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <button onClick={() => onSubmit(order.id, title, description)} disabled={!title}>
            Guardar
          </button>
          <button onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function DetailModal({
  order,
  onClose,
}: {
  order: WorkOrder
  onClose: () => void
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{order.title}</h3>
        <p><strong>Descripción:</strong> {order.description ?? "Sin descripción"}</p>
        <p><strong>Estado:</strong> {STATUS_LABELS[order.status]}</p>
        <p><strong>Creada:</strong> {new Date(order.created_at).toLocaleDateString("es-AR")}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}