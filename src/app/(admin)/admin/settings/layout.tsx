'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Settings, 
  Package, 
  Truck, 
  Building2, 
  Palette, 
  ShieldCheck, 
  Users, 
  Zap, 
  Plug,
  ChevronRight
} from 'lucide-react'

interface SettingsNavItem {
  href: string
  icon: React.ReactNode
  label: string
  description: string
}

const settingsNavItems: SettingsNavItem[] = [
  { 
    href: '/admin/settings/general', 
    icon: <Settings className="w-5 h-5" />, 
    label: 'General',
    description: 'Support contact, PMB format, pickup hours'
  },
  { 
    href: '/admin/settings/offerings', 
    icon: <Package className="w-5 h-5" />, 
    label: 'Offerings',
    description: 'Mailbox plans and pricing'
  },
  { 
    href: '/admin/settings/carriers', 
    icon: <Truck className="w-5 h-5" />, 
    label: 'Carriers',
    description: 'Enabled shipping carriers'
  },
  { 
    href: '/admin/settings/banks', 
    icon: <Building2 className="w-5 h-5" />, 
    label: 'Banks',
    description: 'Bank institutions for deposits'
  },
  { 
    href: '/admin/settings/brand', 
    icon: <Palette className="w-5 h-5" />, 
    label: 'Brand',
    description: 'Colors, logo, portal appearance'
  },
  { 
    href: '/admin/settings/compliance', 
    icon: <ShieldCheck className="w-5 h-5" />, 
    label: 'Compliance',
    description: 'USPS Form 1583 settings'
  },
  { 
    href: '/admin/settings/access', 
    icon: <Users className="w-5 h-5" />, 
    label: 'Access',
    description: 'Staff users and invitations'
  },
  { 
    href: '/admin/settings/automations', 
    icon: <Zap className="w-5 h-5" />, 
    label: 'Automations',
    description: 'Auto-processing rules'
  },
  { 
    href: '/admin/settings/integrations', 
    icon: <Plug className="w-5 h-5" />, 
    label: 'Integrations',
    description: 'Stripe, EasyPost, OfficeRnD'
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex gap-6 h-[calc(100vh-6rem)]">
      {/* Left Navigation */}
      <nav className="w-72 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your operator settings</p>
          </div>
          <div className="py-2">
            {settingsNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 mx-2 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-yellow-50 text-gray-900" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "mt-0.5",
                    isActive ? "text-[#FFCC00]" : "text-gray-400 group-hover:text-gray-500"
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm",
                      isActive ? "text-gray-900" : "text-gray-700"
                    )}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0",
                    isActive ? "text-[#FFCC00]" : "text-gray-300"
                  )} />
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
