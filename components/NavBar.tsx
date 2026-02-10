"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRole } from "@/hooks/useRole"
import { getNavItems } from "@/config/permissions"

export default function Navbar() {
  const { role, loading } = useRole()
  const pathname = usePathname()
  const items = getNavItems(role)

  if (loading) return null

  return (
    <nav>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname === item.href ? "active" : ""}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}