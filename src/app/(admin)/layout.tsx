'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Mail, ClipboardList, Users, Settings, Command } from 'lucide-react'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
}

const navItems: NavItem[] = [
  { href: '/admin', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
  { href: '/admin/mail', icon: <Mail className="w-5 h-5" />, label: 'Mail' },
  { href: '/admin/alias-submissions', icon: <ClipboardList className="w-5 h-5" />, label: 'Aliases' },
  { href: '/admin/customers', icon: <Users className="w-5 h-5" />, label: 'Customers' },
  { href: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      {/* Left Rail Navigation - Icon Only */}
      <nav className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 fixed h-full z-10">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-10 h-10 bg-[#FFCC00] rounded-lg flex items-center justify-center">
            <span className="font-bold text-black text-sm">C3</span>
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative group",
                  isActive 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                )}
              >
                {item.icon}
                
                {/* Tooltip */}
                <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute left-0 w-1 h-6 bg-[#FFCC00] rounded-r-full" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Command Palette Trigger */}
        <button 
          className="mt-auto w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          title="Command Palette (CMD+K)"
        >
          <Command className="w-5 h-5" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-16 p-6">
        {children}
      </main>
    </div>
  )
}
