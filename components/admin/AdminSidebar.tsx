'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Layers,
  Link as LinkIcon,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',   href: '/admin',           icon: LayoutDashboard },
  { label: 'Products',    href: '/admin/products',   icon: Package },
  { label: 'Orders',      href: '/admin/orders',     icon: ShoppingCart },
  { label: 'Subscribers', href: '/admin/subscribers',icon: Users },
  { label: 'Pages',       href: '/admin/pages',      icon: FileText },
  { label: 'Sections',    href: '/admin/sections',   icon: Layers },
  { label: 'Navigation',  href: '/admin/navigation', icon: LinkIcon },
  { label: 'Settings',    href: '/admin/settings',   icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-[260px] flex-shrink-0 bg-surface border-r border-bvp-border flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-bvp-border">
        <span className="font-display text-3xl text-orange leading-none">BVP</span>
        <p className="font-body text-xs text-text-faint uppercase tracking-widest mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded font-body text-sm uppercase tracking-wider transition-colors ${
                active
                  ? 'border-l-2 border-orange text-text bg-orange/5 pl-[10px]'
                  : 'text-text-muted hover:text-text hover:bg-surface2'
              }`}
            >
              <item.icon size={16} className="flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-bvp-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded font-body text-sm uppercase tracking-wider text-text-muted hover:text-text hover:bg-surface2 transition-colors"
        >
          <LogOut size={16} className="flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
