// config/permissions.ts

export const ROLES = ["admin", "supervisor"] as const
export type Role = (typeof ROLES)[number]

export const STATUS = {
  ABIERTA: 1,
  REALIZADA: 2,
  VERIFICADA: 3,
} as const

export const STATUS_LABELS: Record<number, string> = {
  1: "Abierta",
  2: "Realizada",
  3: "Verificada",
}

export const PERMISSIONS = {
  employees: {
    view: ["admin", "supervisor"],
    create: ["admin"],
    edit: ["admin"],
    delete: ["admin"],
  },

  work_orders: {
    view: ["admin", "supervisor"],
    create: ["admin"],
    edit: ["admin"],
    delete: ["admin"],
    detail: ["admin", "supervisor"],
    advance: {
      supervisor: { from: 1, to: 2 },  // abierta → realizada
      admin: { from: 2, to: 3 },        // realizada → verificada
    },
  },

  reports: {
    view: ["admin"],
    export: ["admin"],
  },

  user_management: {
    view: ["admin"],
    assign_roles: ["admin"],
  },
} as const

// ---------- Helpers ----------

export function can(
  role: Role | null,
  resource: keyof typeof PERMISSIONS,
  action: string
): boolean {
  if (!role) return false
  const resourcePerms = PERMISSIONS[resource]
  const actionPerms = (resourcePerms as any)[action]
  if (!actionPerms) return false
  if (Array.isArray(actionPerms)) return actionPerms.includes(role)
  return role in actionPerms
}

export function canAdvance(
  role: Role | null,
  currentStatus: number
): boolean {
  if (!role) return false
  const advance = (PERMISSIONS.work_orders.advance as any)[role]
  if (!advance) return false
  return advance.from === currentStatus
}

export function getNextStatusLabel(currentStatus: number): string | null {
  const next = currentStatus + 1
  return STATUS_LABELS[next] ?? null
}