export const ROLES = ["supremo", "admin", "supervisor"] as const
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

// --- Navegación por rol ---
export type NavItem = {
  label: string
  href: string
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  supremo: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Órdenes de trabajo", href: "/work_orders" },
    { label: "Cuadrillas", href: "/cuadrillas" },
    { label: "Empleados", href: "/employees" },
    { label: "Usuarios", href: "/users" },
    { label: "Importar", href: "/import" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Órdenes de trabajo", href: "/work_orders" },
    { label: "Cuadrillas", href: "/cuadrillas" },
    { label: "Empleados", href: "/employees" },
    { label: "Usuarios", href: "/users" },
  ],
  supervisor: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Órdenes de trabajo", href: "/work_orders" },
    { label: "Cuadrillas", href: "/cuadrillas" },
  ],
}

// --- Permisos por recurso ---
export const PERMISSIONS = {
  employees: {
    view: ["supremo", "admin", "supervisor"],
    create: ["supremo", "admin"],
    edit: ["supremo", "admin"],
    delete: ["supremo", "admin"],
  },

  work_orders: {
    view: ["supremo", "admin", "supervisor"],
    create: ["supremo", "admin"],
    edit: ["supremo", "admin"],
    delete: ["supremo", "admin"],
    detail: ["supremo", "admin", "supervisor"],
    advance: {
      supervisor: { from: 1, to: 2 },
      admin: { from: 2, to: 3 },
    },
  },

  reports: {
    view: ["supremo", "admin"],
    export: ["supremo", "admin"],
  },

  user_management: {
    view: ["supremo", "admin"],
    assign_roles: ["supremo", "admin"],
  },
} as const

// ---------- Helpers ----------

export function can(
  role: Role | null,
  resource: keyof typeof PERMISSIONS,
  action: string
): boolean {
  if (!role) return false

  if (role === "supremo") return true

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
  if (role === "supremo") return true

  const advance = (PERMISSIONS.work_orders.advance as any)[role]
  if (!advance) return false
  return advance.from === currentStatus
}

export function getNextStatusLabel(currentStatus: number): string | null {
  const next = currentStatus + 1
  return STATUS_LABELS[next] ?? null
}

export function getNavItems(role: Role | null): NavItem[] {
  if (!role) return []
  return NAV_ITEMS[role] ?? []
}
